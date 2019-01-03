import { errorOrEmpty, Omit } from './helpers';
import { Operation } from './context/operation';
import {
    DataContext,
    ListContext,
    DeleteContext,
    UpdateContext,
    CreateContext,
    DetailContext,
} from './context/crudContext';
import { Definitions } from './settings/definitions';
import { bootstrapConfiguration } from './service/bootstrap';

const createService = <T extends { id: any }, C extends object>(defs: Definitions<T>) => {
    const implementation = bootstrapConfiguration<T, C>(defs);
    /**
     * Fetch resource, throw error when resource missing.
     * This method is used for handlers working with a single existing resource (get, update, delete)
     */
    const getSafe = (context: Pick<DetailContext<T, C>, 'id' | 'context' | 'options'>): Promise<T> =>
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

    const handlers = {
        detailHandler,
        createHandler,
        updateHandler,
        deleteHandler,
        listHandler,
    };

    return {
        ...implementation,
        ...handlers,
    };
};

export default createService;
export const buildService = <T extends { id: any }, C>(
    buildingDefs: Definitions<T, C>,
    prevDefs?: Definitions<T, C>
) => {
    const mergedDefs = Object.assign({}, prevDefs, buildingDefs);
    return {
        createService: (defs: Definitions<T, C>) => createService(Object.assign({}, defs, mergedDefs)),
        buildService: (defs: Definitions<T, C>) => buildService(defs, mergedDefs),
    };
};
