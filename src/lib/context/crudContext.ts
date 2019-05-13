import { Operation } from './operation';

export interface BaseCrudContext<T, C> {
    /** Http context you use in your application. Usually includes user, locale additional query parameters etc. */
    context: C;
    /** Options passed to your data manipulation logic. Contains data from (1) context, (2) dynamic options from `getOptions` and (3) direct options passed on when creating a handler. */
    options: any;
    type: Operation;
    /** True for create or update */
    write: boolean;
    /** True for detail, list */
    safe: boolean;

    // Only in some operations:

    /**
     * Existing resource client is manipulating.
     * Present in the following operations:
     * - Detail (entity client is trying to fetch)
     * - Update (existing entity before the update)
     * - Delete (entity client is trying to destroy)
     */
    entity?: T;
    /**
     * Data sent by client to update or create resource.
     * It represents the new, complete resource -- thusly when
     * updating a single attribute,data contains not just the new
     * attribute, but also all the attributes existing on the
     * resource before the update.
     *
     * In other words, `data` is `entity` with overwritten data sent by client.
     * To get _only_ data sent by client, see `bareData`.
     *
     * Present in the following operations:
     * - Create (data client provides to create a resource)
     * - Update (client's data for update with attributes defaulting to existing resource)
     */
    data?: any;
    /** Data sent by client, only available on Update */
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
    bareData: any;
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
export type CrudContext<T, C> =
    | DetailContext<T, C>
    | UpdateContext<T, C>
    | CreateContext<T, C>
    | DeleteContext<T, C>
    | ListContext<T, C>;

export type DataContext<T, C> = Pick<
    CreateContext<T, C> | UpdateContext<T, C>,
    // tslint:disable-next-line max-union-size
    'data' | 'context' | 'options' | 'type'
>;
