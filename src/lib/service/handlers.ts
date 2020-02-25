import {
    forgeCreateContext,
    forgeDeleteContext,
    forgeDetailContext,
    forgeListContext,
    forgeUpdateContext,
} from '../context/contextCreators';
import { CreateContext, DeleteContext, DetailContext, ListContext, UpdateContext } from '../context/crudContext';
import { Operation } from '../context/operation';
import { errorOrEmpty } from '../helpers';
import { ServiceImplementation } from '../settings/definitions';

export type DetailHandler<T, C, K extends keyof T> = (id: T[K], context: C) => Promise<T>;
export type CreateHandler<T, C> = (data: any, context: C) => Promise<T>;
export type UpdateHandler<T, C, K extends keyof T> = (id: T[K], data: any, context: C) => Promise<T>;
export type DeleteHandler<T, C, K extends keyof T> = (id: T[K], context: C) => Promise<T>;
export type ListHandler<T, C> = (filters: any, context: C) => Promise<T[]>;

export interface HandlerCreators<T, C, K extends keyof T> {
    detailHandler: (options?: any) => DetailHandler<T, C, K>;
    createHandler: (options?: any) => CreateHandler<T, C>;
    updateHandler: (options?: any) => UpdateHandler<T, C, K>;
    deleteHandler: (options?: any) => DeleteHandler<T, C, K>;
    listHandler: (options?: any) => ListHandler<T, C>;
}

export const createHandlers = <T, C extends object, K extends keyof T>(
    implementation: ServiceImplementation<T, C, K>
): HandlerCreators<T, C, K> => {
    /**
     * Fetch resource, throw error when resource missing.
     * This method is used for handlers working with a single existing resource (get, update, delete)
     */
    const safeDetail = (context: Pick<DetailContext<T, C, K>, 'id' | 'context' | 'options'>): PromiseLike<T> =>
        implementation
            .detail({ ...context, type: Operation.DETAIL, write: false, safe: true })
            .then(errorOrEmpty(implementation.createNotFoundError()));

    const bootstrapOption = (operation: Operation, options: any = {}, context: C) =>
        Promise.resolve(implementation.getOptions(operation)).then(dynamicOptions => ({
            ...dynamicOptions,
            ...options,
            ...(context as object),
        }));

    const detailHandler = (options: any = {}): DetailHandler<T, C, K> => async (id: T[K], context: C) => {
        options = await bootstrapOption(Operation.DETAIL, options, context);
        const entity = await safeDetail({ id, context, options });
        const ctx: DetailContext<T, C, K> = forgeDetailContext({
            id,
            context,
            entity,
            options,
        });
        await implementation.authorize(ctx);
        const result = ctx.entity;
        return implementation.postprocessData(result, ctx);
    };
    const createHandler = (options: any = {}): CreateHandler<T, C> => async (data: any, context: C) => {
        options = await bootstrapOption(Operation.CREATE, options, context);
        const ctx: CreateContext<T, C> = forgeCreateContext({
            data,
            context,
            options,
            bareData: data,
        });
        const processedData = await implementation.processData(ctx.data, ctx);
        ctx.data = processedData;
        await implementation.authorize(ctx);
        const result = implementation.create(ctx);
        return implementation.postprocessData(result, ctx);
    };
    const updateHandler = (options: any = {}): UpdateHandler<T, C, K> => async (id: T[K], data: any, context: C) => {
        options = await bootstrapOption(Operation.UPDATE, options, context);
        const entity = await safeDetail({ id, context, options });
        const ctx: UpdateContext<T, C> = forgeUpdateContext({
            data,
            context,
            entity,
            options,
            bareData: data,
        });
        const processedData = await implementation.processData(ctx.data, ctx);
        ctx.data = processedData;
        await implementation.authorize(ctx);
        const result = implementation.update(ctx);
        return implementation.postprocessData(result, ctx);
    };

    const deleteHandler = (options: any = {}): DeleteHandler<T, C, K> => async (id: T[K], context: C) => {
        options = await bootstrapOption(Operation.DELETE, options, context);
        const entity = await safeDetail({ id, context, options });
        const ctx: DeleteContext<T, C, K> = forgeDeleteContext({
            id,
            context,
            entity,
            options,
        });
        await implementation.authorize(ctx);
        const result = implementation.delete(ctx);
        return implementation.postprocessData(result, ctx);
    };

    const listHandler = (options: any = {}): ListHandler<T, C> => async (filters: any, context: C) => {
        options = await bootstrapOption(Operation.LIST, options, context);
        const ctx: ListContext<T, C> = forgeListContext({
            context,
            options,
            filters,
        });
        const processedData = await implementation.processData(ctx.filters, ctx);
        ctx.filters = processedData;
        await implementation.authorize(ctx);
        const result = implementation.list(ctx);
        return implementation.postprocessData(result, ctx);
    };

    return {
        detailHandler,
        createHandler,
        updateHandler,
        deleteHandler,
        listHandler,
    };
};
