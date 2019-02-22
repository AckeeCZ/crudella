import {
    CreateContext,
    CrudContext,
    DataContext,
    DeleteContext,
    DetailContext,
    ListContext,
    UpdateContext,
} from '../context/crudContext';
import { Operation } from '../context/operation';
import { Omit } from '../helpers';
import { CrudController } from '../service/controller';
import { CrudRepository } from './repository';

export interface Definitions<T, C = any> {
    /**
     * Find entity by id (stored in ReadContext)
     * Implement to use `detailHandler`
     */
    detail?: (context: Omit<DetailContext<T, C>, 'entity'>) => PromiseLike<T>;
    /**
     * Create entity from data (stored in CreateContext)
     * Implement to use `createHandler`
     */
    create?: (context: CreateContext<T, C>) => PromiseLike<T>;
    /**
     * Update entity with new data (both in UpdateContext)
     * Implement to use `updateHandler`
     */
    update?: (context: UpdateContext<T, C>) => PromiseLike<T>;
    /**
     * Delete entity (fetched in DeleteContext)
     * Implement to use `deleteHandler`
     */
    delete?: (context: DeleteContext<T, C>) => PromiseLike<any>;
    /**
     * List entities, optionally filter (filters stored in ListContext)
     * Implement to use `listHandler`
     */
    list?: (context: ListContext<T, C>) => PromiseLike<T[]>;

    repository?: CrudRepository<T>;
    /**
     * This method processes any incoming data coming from user.
     * Data processing is called for Create and Update.
     * Override the method for custom data transformation.
     */
    processData?: ({ data }: DataContext<T, C>) => PromiseLike<any> | any;
    /**
     * Reject access to any given handler based on CrudContext.
     * This method is called before each handler is finished. To reject access, throw Error.
     * Override the method for custom ACL or validation.
     */
    authorize?: (context: CrudContext<T, C>) => PromiseLike<any> | any;
    /**
     * Override to throw custom error when resource not found.
     */
    createNotFoundError?: () => Error;
    getOptions?: (operation: Operation) => PromiseLike<any> | any;
    controller?: CrudController<T, C>;
    options?: {
        allowedOperations?: Operation[];
    };
}

export type ServiceImplementation<T, C> = Omit<Required<Definitions<T, C>>, 'repository'>;
