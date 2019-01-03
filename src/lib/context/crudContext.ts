import { Operation } from './operation';

export interface BaseCrudContext<T, C> {
    /** Http context */
    context: C;
    options: any;
    type: Operation;
    /** True for create or update */
    write: boolean;
    /** True for detail, list */
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
export type CrudContext<T, C> =
    | DetailContext<T, C>
    | UpdateContext<T, C>
    | CreateContext<T, C>
    | DeleteContext<T, C>
    | ListContext<T, C>;
export type DataContext<T, C> = Pick<
    CreateContext<T, C> | UpdateContext<T, C>,
    'data' | 'context' | 'options' | 'type'
>;
