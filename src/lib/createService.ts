import { Omit } from './internal';

const notFoundOnNull = (err: Error) => (res: any) => {
    if (!res) {
        throw err;
    }
    return res;
};

export enum Operation {
    DETAIL = 'DETAIL',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    CREATE = 'CREATE',
    LIST = 'LIST',
}

export interface BaseCrudContext<T, C> {
    /** Http context */
    context: C;
    options: any;
    type: Operation;
    /** True for create or update */
    write: boolean;
    /** True for get, list */
    safe: boolean;

    // Only in some operations:

    /** Existing resource */
    entity?: T;
    /**
     * Data to update, create
     * This contains `entity`, with overwritten data sent by client.
     * To get _only_ data sent by client, see `bareData`
     */
    data?: any;
    /** Data sent by client */
    bareData?: any;
}
export interface DetailContext<T, C> extends BaseCrudContext<T, C> {
    id: number;
    entity: T;
    type: Operation.DETAIL;
    write: false;
    safe: true;
}
export interface UpdateContext<T, C> extends BaseCrudContext<T, C> {
    data: any;
    entity: T;
    type: Operation.UPDATE;
    write: true;
    bareData: any;
    safe: false;
}
export interface CreateContext<T, C> extends BaseCrudContext<T, C> {
    type: Operation.CREATE;
    data: any;
    write: true;
    safe: false;
}
export interface DeleteContext<T, C> extends BaseCrudContext<T, C> {
    entity: T;
    type: Operation.DELETE;
    id: number;
    write: false;
    safe: false;
}
export interface ListContext<T, C> extends BaseCrudContext<T, C> {
    filters: any;
    type: Operation.LIST;
    write: false;
    safe: true;
}
export type CrudContext<T, C> = DetailContext<T, C> | UpdateContext<T, C> | CreateContext<T, C> | DeleteContext<T, C> | ListContext<T, C>;
export type DataContext<T, C> = Pick<CreateContext<T, C> | UpdateContext<T, C>, 'data' | 'context' | 'options' | 'type'>;
export interface CrudRepository<T> {
    detailById: (id: number, options: any) => Promise<T>;
    create: (data: any, options: any) => Promise<T>;
    updateById: (id: number, data: any, options: any) => Promise<T>;
    deleteById: (id: number, options: any) => Promise<T>;
    list: (filters: any, options: any) => Promise<T[]>;
}
export interface Definitions<T, C = any> {
    /**
     * Find entity by id (stored in ReadContext)
     * Implement to use `getHandler`
     */
    get?: (context: Omit<DetailContext<T, C>, 'entity'>) => Promise<T>;
    /**
     * Create entity from data (stored in CreateContext)
     * Implement to use `createHandler`
     */
    create?: (context: CreateContext<T, C>) => Promise<T>;
    /**
     * Update entity with new data (both in UpdateContext)
     * Implement to use `updateHandler`
     */
    update?: (context: UpdateContext<T, C>) => Promise<T>;
    /**
     * Delete entity (fetched in DeleteContext)
     * Implement to use `deleteHandler`
     */
    delete?: (context: DeleteContext<T, C>) => Promise<T>;
    /**
     * List entities, optionally filter (filters stored in ListContext)
     * Implement to use `listHandler`
     */
    list?: (context: ListContext<T, C>) => Promise<T[]>;

    repository?: CrudRepository<T>;
    /**
     * This method processes any incoming data coming from user.
     * Data processing is called for Create and Update.
     * Override the method for custom data transformation.
     */
    processData?: ({ data }: DataContext<T, C>) => Promise<any> | any;
    /**
     * Reject access to any given handler based on CrudContext.
     * This method is called before each handler is finished. To reject access, throw Error.
     * Override the method for custom ACL or validation.
     */
    authorize?: (context: CrudContext<T, C>) => Promise<any> | any;
    /**
     * Override to throw custom error when resource not found.
     */
    createNotFoundError?: () => Error;
    getOptions?: (operation: Operation) => Promise<any> | any;
}
const createService = <T extends { id: any }, C extends object>(defs: Definitions<T>) => {
    const defaultImplementation: Omit<Required<Definitions<T>>, 'repository'> = {
        get: (() => Promise.reject()),
        create: (() => Promise.reject()),
        update: (() => Promise.reject()),
        delete: (() => Promise.reject()),
        list: (() => Promise.reject()),
        authorize: (() => new Error()),
        processData: (({ data }: DataContext<T, C>) => data),
        createNotFoundError: (() => new Error()),
        getOptions: (() => ({})),
    };
    const repoImplementation: Pick<Required<Definitions<T>>, 'get' | 'create' | 'update' | 'delete' | 'list'> | {} = defs.repository ? {
        get: ctx => defs.repository!.detailById(ctx.id, ctx.options),
        create: ctx => defs.repository!.create(ctx.data, ctx.options),
        update: ctx => defs.repository!.updateById(ctx.entity.id, ctx.data, ctx.options),
        delete: ctx => defs.repository!.deleteById(ctx.entity.id, ctx.options),
        list: ctx => defs.repository!.list(ctx.filters, ctx.options),
    } : {};
    const implementation = Object.assign({}, defaultImplementation, repoImplementation, defs);
    /**
     * Fetch resource, throw error when resource missing.
     * This method is used for handlers working with a single existing resource (get, update, delete)
     */
    const getSafe = (context: Pick<DetailContext<T, C>, 'id' | 'context' | 'options'>): Promise<T> =>
        implementation.get({ ...context, type: Operation.DETAIL, write: false, safe: true })
            .then(notFoundOnNull(implementation.createNotFoundError()));

    const getHandler = (options: any = {}) => async (id: number, context: C) => {
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
        const ctx: CreateContext<T, C> = await Promise.resolve(implementation.processData({ data, context, options, type: Operation.CREATE }))
            .then(processedData => ({
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
        getHandler,
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
export const buildService = <T extends { id: any }, C>(buildingDefs: Definitions<T, C>, prevDefs?: Definitions<T, C>) => {
    const mergedDefs = Object.assign({}, prevDefs, buildingDefs);
    return {
        createService: (defs: Definitions<T, C>) => createService(Object.assign({}, defs, mergedDefs)),
        buildService: (defs: Definitions<T, C>) => buildService(defs, mergedDefs),
    };
};
