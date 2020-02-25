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

export interface Definitions<T, C, K extends keyof T> {
    /**
     * Find entity by id (stored in ReadContext)
     * Implement to use `detailHandler`
     */
    detail?: (context: Omit<DetailContext<T, C, K>, 'entity'>) => PromiseLike<T>;
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
    delete?: (context: DeleteContext<T, C, K>) => PromiseLike<any>;
    /**
     * List entities, optionally filter (filters stored in ListContext)
     * Implement to use `listHandler`
     */
    list?: (context: ListContext<T, C>) => PromiseLike<T[]>;

    repository?: CrudRepository<T, K>;
    idKey?: K;
    /**
     * This method processes any incoming data coming from user.
     * Data processing is called for Create, Update and List (filters).
     * Override the method for custom data transformation.
     */
    processData?: (data: any, ctx: DataContext<T, C>) => PromiseLike<any> | any;

    /**
     * Process data coming from the service.
     */
    postprocessData?: (returnValue: any, context: CrudContext<T, C, K>) => PromiseLike<any> | any;
    /**
     * Reject access to any given handler based on CrudContext.
     * This method is called before each handler is finished. To reject access, throw Error.
     * Override the method for custom ACL or validation.
     */
    authorize?: (context: CrudContext<T, C, K>) => PromiseLike<any> | any;
    /**
     * Override to throw custom error when resource not found.
     */
    createNotFoundError?: () => Error;
    getOptions?: (operation: Operation) => PromiseLike<any> | any;
    controller?: CrudController<T, C, K>;
    options?: {
        allowedOperations?: Operation[];
    };
}

export type ServiceImplementation<T, C, K extends keyof T> = Omit<Required<Definitions<T, C, K>>, 'repository'>;
