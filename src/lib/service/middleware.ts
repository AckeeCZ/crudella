import { Router } from 'express';
import { getDefaultController } from './controller';
import { HandlerCreators } from './handlers';

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
