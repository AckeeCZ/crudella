import { RequestHandler } from 'express';
import { CreateHandler, DeleteHandler, DetailHandler, ListHandler, UpdateHandler } from './handlers';

export interface CrudController<T, C, K extends keyof T> {
    detailAction: (handler: DetailHandler<T, C, K>, idName: string) => RequestHandler;
    createAction: (handler: CreateHandler<T, C>) => RequestHandler;
    updateAction: (handler: UpdateHandler<T, C, K>, idName: string) => RequestHandler;
    deleteAction: (handler: DeleteHandler<T, C, K>, idName: string) => RequestHandler;
    listAction: (handler: ListHandler<T, C>) => RequestHandler;
}

export const getDefaultController = <T, C extends {}, K extends keyof T>(): CrudController<T, C, K> => ({
    detailAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName] as any, {} as C).then(result => res.json(result)),
    createAction: handler => ({ body }, res) => handler(body, {} as C).then(result => res.json(result)),
    updateAction: (handler, idName) => ({ params, body }, res) =>
        handler(params[idName] as any, body, {} as C).then(result => res.json(result)),
    deleteAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName] as any, {} as C).then(result => res.json(result)),
    listAction: handler => ({ params }, res) => handler(params, {} as C).then(result => res.json(result)),
});
