import {
    CreateContext,
    CrudContext,
    DataContext,
    DeleteContext,
    DetailContext,
    ListContext,
    UpdateContext,
} from 'lib/context/crudContext';
import { Operation } from 'lib/context/operation';
import { Omit } from 'lib/helpers';
import { CrudRepository } from './repository';

export interface Definitions<T, C = any> {
    /**
     * Find entity by id (stored in ReadContext)
     * Implement to use `detailHandler`
     */
    detail?: (context: Omit<DetailContext<T, C>, 'entity'>) => Promise<T>;
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

export type ServiceImplementation<T, C> = Omit<Required<Definitions<T, C>>, 'repository'>;
