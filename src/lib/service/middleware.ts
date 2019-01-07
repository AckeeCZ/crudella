import { RequestHandler, Router } from 'express';
import { CreateHandler, DeleteHandler, DetailHandler, HandlerCreators, ListHandler, UpdateHandler } from './handlers';

interface CrudController<T, C> {
    detailAction: (handler: DetailHandler<T, C>, idName: string) => RequestHandler;
    createAction: (handler: CreateHandler<T, C>) => RequestHandler;
    updateAction: (handler: UpdateHandler<T, C>, idName: string) => RequestHandler;
    deleteAction: (handler: DeleteHandler<T, C>, idName: string) => RequestHandler;
    listAction: (handler: ListHandler<T, C>) => RequestHandler;
}

const getDefaultController = <T, C extends {}>(): CrudController<T, C> => ({
    detailAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName], {} as C).then(result => res.json(result)),
    createAction: handler => ({ body }, res) => handler(body, {} as C).then(result => res.json(result)),
    updateAction: (handler, idName) => ({ params, body }, res) =>
        handler(params[idName], body, {} as C).then(result => res.json(result)),
    deleteAction: (handler, idName) => ({ params }, res) =>
        handler(params[idName], {} as C).then(result => res.json(result)),
    listAction: handler => ({ params }, res) => handler(params, {} as C).then(result => res.json(result)),
});

export const createMiddlewareFactory = <T, C>(handlers: HandlerCreators<T, C>) => {
    const createMiddleware = (resourceName: string, idName: string = 'resourceId') => {
        const controller = getDefaultController<T, C>();
        const router = Router();
        router
            .route(resourceName)
            .get(controller.listAction(handlers.listHandler({})))
            .post(controller.createAction(handlers.createHandler({})));

        // > /resource/:resourceId
        router
            .route(`${resourceName}:${idName}`)
            .get(controller.detailAction(handlers.detailHandler({}), idName))
            .put(controller.updateAction(handlers.updateHandler({}), idName))
            .delete(controller.deleteAction(handlers.deleteHandler({}), idName));
        return router;
    };
    return createMiddleware;
};
