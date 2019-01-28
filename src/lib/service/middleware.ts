import { Router } from 'express';
import { Operation } from 'lib/context/operation';
import { CrudController } from './controller';
import { HandlerCreators } from './handlers';

export const createMiddlewareFactory = <T, C>(
    handlers: HandlerCreators<T, C>,
    controller: CrudController<T, C>,
    options: {
        allowedOperations: Operation[];
    } = {
        allowedOperations: [Operation.LIST, Operation.CREATE, Operation.DETAIL, Operation.UPDATE, Operation.DELETE],
    }
) => (resourceName: string, idName: string = 'resourceId') => {
    const [collectionRoutes, resourceRoutes] = [Router(), Router()];
    const [mainCollectionRoute, mainResourceRoute] = [collectionRoutes.route('/'), resourceRoutes.route(`/:${idName}`)];
    if (options.allowedOperations.includes(Operation.LIST)) {
        mainCollectionRoute.get(controller.listAction(handlers.listHandler({})));
    }
    if (options.allowedOperations.includes(Operation.CREATE)) {
        mainCollectionRoute.post(controller.createAction(handlers.createHandler({})));
    }
    if (options.allowedOperations.includes(Operation.DETAIL)) {
        mainResourceRoute.get(controller.detailAction(handlers.detailHandler({}), idName));
    }
    if (options.allowedOperations.includes(Operation.UPDATE)) {
        mainResourceRoute.put(controller.updateAction(handlers.updateHandler({}), idName));
    }
    if (options.allowedOperations.includes(Operation.DELETE)) {
        mainResourceRoute.delete(controller.deleteAction(handlers.deleteHandler({}), idName));
    }

    return Router().use(resourceName, collectionRoutes, resourceRoutes);
};
