import { Router } from 'express';
import { Operation } from '../context/operation';
import { CrudController } from './controller';
import { HandlerCreators } from './handlers';

export const createMiddlewareFactory = <T, C, K extends keyof T>(
    handlers: HandlerCreators<T, C, K>,
    controller: CrudController<T, C, K>,
    options?: {
        allowedOperations?: Operation[];
    }
) => (resourceName: string, idName: string = 'resourceId') => {
    options = Object.assign(
        {},
        { allowedOperations: [Operation.LIST, Operation.CREATE, Operation.DETAIL, Operation.UPDATE, Operation.DELETE] },
        options
    );
    const [collectionRoutes, resourceRoutes] = [Router(), Router()];
    const [mainCollectionRoute, mainResourceRoute] = [collectionRoutes.route('/'), resourceRoutes.route(`/:${idName}`)];
    if (options.allowedOperations!.includes(Operation.LIST)) {
        mainCollectionRoute.get(controller.listAction(handlers.listHandler({})));
    }
    if (options.allowedOperations!.includes(Operation.CREATE)) {
        mainCollectionRoute.post(controller.createAction(handlers.createHandler({})));
    }
    if (options.allowedOperations!.includes(Operation.DETAIL)) {
        mainResourceRoute.get(controller.detailAction(handlers.detailHandler({}), idName));
    }
    if (options.allowedOperations!.includes(Operation.UPDATE)) {
        mainResourceRoute.put(controller.updateAction(handlers.updateHandler({}), idName));
    }
    if (options.allowedOperations!.includes(Operation.DELETE)) {
        mainResourceRoute.delete(controller.deleteAction(handlers.deleteHandler({}), idName));
    }

    return Router().use(resourceName, collectionRoutes, resourceRoutes);
};
