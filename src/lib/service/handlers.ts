import { CreateContext, DeleteContext, DetailContext, ListContext, UpdateContext } from 'lib/context/crudContext';
import { Operation } from 'lib/context/operation';
import { errorOrEmpty } from 'lib/helpers';
import { ServiceImplementation } from 'lib/settings/definitions';

export const createHandlers = <T extends { id: any }, C extends object>(
    implementation: ServiceImplementation<T, C>
) => {
    /**
     * Fetch resource, throw error when resource missing.
     * This method is used for handlers working with a single existing resource (get, update, delete)
     */
    const getSafe = (context: Pick<DetailContext<T, C>, 'id' | 'context' | 'options'>): PromiseLike<T> =>
        implementation
            .detail({ ...context, type: Operation.DETAIL, write: false, safe: true })
            .then(errorOrEmpty(implementation.createNotFoundError()));

    const detailHandler = (options: any = {}) => async (id: number, context: C) => {
        const dynamicOptions = await implementation.getOptions(Operation.DETAIL);
        options = { ...dynamicOptions, ...options, ...(context as object) };
        const ctx: DetailContext<T, C> = await getSafe({ id, context, options }).then(entity => ({
            id,
            context,
            entity,
            options,
            type: Operation.DETAIL as Operation.DETAIL,
            write: false as false,
            safe: true as true,
        }));
        await implementation.authorize(ctx);
        return ctx.entity;
    };
    const createHandler = (options: any = {}) => async (data: any, context: C) => {
        const dynamicOptions = await implementation.getOptions(Operation.CREATE);
        options = { ...dynamicOptions, ...options, ...(context as object) };
        const ctx: CreateContext<T, C> = await Promise.resolve(
            implementation.processData({ data, context, options, type: Operation.CREATE })
        ).then(processedData => ({
            context,
            options,
            data: processedData,
            type: Operation.CREATE as Operation.CREATE,
            write: true as true,
            safe: false as false,
        }));
        await implementation.authorize(ctx);
        return implementation.create(ctx);
    };
    const updateHandler = (options: any = {}) => async (id: number, data: any, context: C) => {
        const dynamicOptions = await implementation.getOptions(Operation.UPDATE);
        options = { ...dynamicOptions, ...options, ...(context as object) };
        const ctx: UpdateContext<T, C> = await Promise.all([
            implementation.processData({ data, context, options, type: Operation.UPDATE }),
            getSafe({ id, context, options }),
        ]).then(([processedData, entity]) => ({
            id,
            context,
            entity,
            options,
            data: Object.assign({}, entity, processedData),
            type: Operation.UPDATE as Operation.UPDATE,
            write: true as true,
            bareData: data,
            safe: false as false,
        }));
        await implementation.authorize(ctx);
        return implementation.update(ctx);
    };

    const deleteHandler = (options: any = {}) => async (id: number, context: C) => {
        const dynamicOptions = await implementation.getOptions(Operation.DELETE);
        options = { ...dynamicOptions, ...options, ...(context as object) };
        const ctx: DeleteContext<T, C> = await getSafe({ id, context, options }).then(entity => ({
            id,
            context,
            entity,
            options,
            type: Operation.DELETE as Operation.DELETE,
            write: false as false,
            safe: false as false,
        }));
        await implementation.authorize(ctx);
        return implementation.delete(ctx);
    };

    const listHandler = (options: any = {}) => async (filters: any, context: C) => {
        const dynamicOptions = await implementation.getOptions(Operation.LIST);
        options = { ...dynamicOptions, ...options, ...(context as object) };
        const ctx: ListContext<T, C> = {
            context,
            options,
            filters,
            type: Operation.LIST,
            write: false as false,
            safe: true as true,
        };
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
