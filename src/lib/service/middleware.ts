import { Router } from 'express';
import { CrudController } from './controller';
import { HandlerCreators } from './handlers';

export const createMiddlewareFactory = <T, C>(handlers: HandlerCreators<T, C>, controller: CrudController<T, C>) => (
    resourceName: string,
    idName: string = 'resourceId'
) => {
    const [collectionRoutes, resourceRoutes] = [Router(), Router()];
    collectionRoutes
        .route('/')
        .get(controller.listAction(handlers.listHandler({})))
        .post(controller.createAction(handlers.createHandler({})));
    resourceRoutes
        .route(`/:${idName}`)
        .get(controller.detailAction(handlers.detailHandler({}), idName))
        .put(controller.updateAction(handlers.updateHandler({}), idName))
        .delete(controller.deleteAction(handlers.deleteHandler({}), idName));

    return Router().use(resourceName, collectionRoutes, resourceRoutes);
};
