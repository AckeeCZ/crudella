import { bootstrapConfiguration } from './service/bootstrap';
import { createHandlers } from './service/handlers';
import { createMiddlewareFactory } from './service/middleware';
import { Definitions } from './settings/definitions';

export const createService = <T extends { id: any }, C extends object = {}>(defs: Definitions<T>) => {
    const implementation = bootstrapConfiguration<T, C>(defs);
    const handlers = createHandlers(implementation);
    const createMiddleware = createMiddlewareFactory(handlers, implementation.controller, defs.options);

    return {
        ...implementation,
        ...handlers,
        createMiddleware,
    };
};

export const buildService = <T extends { id: any }, C = {}>(
    buildingDefs: Definitions<T, C>,
    prevDefs?: Definitions<T, C>
) => {
    const mergedDefs = Object.assign({}, prevDefs, buildingDefs);
    return {
        createService: (defs: Definitions<T, C>) => createService(Object.assign({}, defs, mergedDefs)),
        buildService: (defs: Definitions<T, C>) => buildService(defs, mergedDefs),
    };
};
