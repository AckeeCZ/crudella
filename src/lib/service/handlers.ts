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

export type DetailHandler<T, C> = (id: number, context: C) => Promise<T>;
export type CreateHandler<T, C> = (data: any, context: C) => Promise<T>;
export type UpdateHandler<T, C> = (id: number, data: any, context: C) => Promise<T>;
export type DeleteHandler<T, C> = (id: number, context: C) => void;
export type ListHandler<T, C> = (filters: any, context: C) => Promise<T[]>;

export interface HandlerCreators<T, C> {
    detailHandler: (options?: any) => DetailHandler<T, C>;
    createHandler: (options?: any) => CreateHandler<T, C>;
    updateHandler: (options?: any) => UpdateHandler<T, C>;
    deleteHandler: (options?: any) => DeleteHandler<T, C>;
    listHandler: (options?: any) => ListHandler<T, C>;
}

export const createHandlers = <T extends { id: any }, C extends object>(
    implementation: ServiceImplementation<T, C>
): HandlerCreators<T, C> => {
    /**
     * Fetch resource, throw error when resource missing.
     * This method is used for handlers working with a single existing resource (get, update, delete)
     */
    const safeDetail = (context: Pick<DetailContext<T, C>, 'id' | 'context' | 'options'>): PromiseLike<T> =>
        implementation
            .detail({ ...context, type: Operation.DETAIL, write: false, safe: true })
            .then(errorOrEmpty(implementation.createNotFoundError()));

    const bootstrapOption = (operation: Operation, options: any = {}, context: C) =>
        Promise.resolve(implementation.getOptions(operation)).then(dynamicOptions => ({
            ...dynamicOptions,
            ...options,
            ...(context as object),
        }));

    const detailHandler = (options: any = {}): DetailHandler<T, C> => async(id: number, context: C) => {
        options = await bootstrapOption(Operation.DETAIL, options, context);
        const entity = await safeDetail({ id, context, options });
        const ctx: DetailContext<T, C> = forgeDetailContext({
            id,
            context,
            entity,
            options,
        });
        await implementation.authorize(ctx);
        return ctx.entity;
    };
    const createHandler = (options: any = {}): CreateHandler<T, C> => async(data: any, context: C) => {
        options = await bootstrapOption(Operation.CREATE, options, context);
        const processedData = implementation.processData({ data, context, options, type: Operation.CREATE });
        const ctx: CreateContext<T, C> = forgeCreateContext({
            context,
            options,
            data: processedData,
            bareData: data,
        });
        await implementation.authorize(ctx);
        return implementation.create(ctx);
    };
    const updateHandler = (options: any = {}): UpdateHandler<T, C> => async(id: number, data: any, context: C) => {
        options = await bootstrapOption(Operation.UPDATE, options, context);
        const processedData = await implementation.processData({ data, context, options, type: Operation.UPDATE });
        const entity = await safeDetail({ id, context, options });
        const ctx: UpdateContext<T, C> = forgeUpdateContext({
            context,
            entity,
            options,
            data: processedData,
            bareData: data,
        });
        await implementation.authorize(ctx);
        return implementation.update(ctx);
    };

    const deleteHandler = (options: any = {}): DeleteHandler<T, C> => async(id: number, context: C) => {
        options = await bootstrapOption(Operation.DELETE, options, context);
        const entity = await safeDetail({ id, context, options });
        const ctx: DeleteContext<T, C> = forgeDeleteContext({
            id,
            context,
            entity,
            options,
        });
        await implementation.authorize(ctx);
        return implementation.delete(ctx);
    };

    const listHandler = (options: any = {}): ListHandler<T, C> => async(filters: any, context: C) => {
        options = await bootstrapOption(Operation.LIST, options, context);
        const ctx: ListContext<T, C> = forgeListContext({
            context,
            options,
            filters,
        });
        await implementation.authorize(ctx);
        return implementation.list(ctx);
    };

    return {
        detailHandler,
        createHandler,
        updateHandler,
        deleteHandler,
        listHandler,
    };
};
