import { RequestHandler } from 'express';
import { CreateHandler, DeleteHandler, DetailHandler, ListHandler, UpdateHandler } from './handlers';

export interface CrudController<T, C> {
    detailAction: (handler: DetailHandler<T, C>, idName: string) => RequestHandler;
    createAction: (handler: CreateHandler<T, C>) => RequestHandler;
    updateAction: (handler: UpdateHandler<T, C>, idName: string) => RequestHandler;
    deleteAction: (handler: DeleteHandler<T, C>, idName: string) => RequestHandler;
    listAction: (handler: ListHandler<T, C>) => RequestHandler;
}

export const getDefaultController = <T, C extends {}>(): CrudController<T, C> => ({
    detailAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName], {} as C).then(result => res.json(result)),
    createAction: handler => ({ body }, res) => handler(body, {} as C).then(result => res.json(result)),
    updateAction: (handler, idName) => ({ params, body }, res) =>
        handler(params[idName], body, {} as C).then(result => res.json(result)),
    deleteAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName], {} as C).then(result => res.json(result)),
    listAction: handler => ({ params }, res) => handler(params, {} as C).then(result => res.json(result)),
});
