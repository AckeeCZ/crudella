import { bootstrapConfiguration } from './service/bootstrap';
import { createHandlers } from './service/handlers';
import { createMiddlewareFactory } from './service/middleware';
import { Definitions } from './settings/definitions';

export const createService = <T, C extends object, K extends keyof T>(defs: Definitions<T, C, K>) => {
    const implementation = bootstrapConfiguration<T, C, K>(defs);
    const handlers = createHandlers(implementation);
    const createMiddleware = createMiddlewareFactory(handlers, implementation.controller, defs.options);

    return {
        ...implementation,
        ...handlers,
        createMiddleware,
    };
};

export const buildService = <T, C extends object, K extends keyof T>(
    buildingDefs: Definitions<T, C, K>,
    prevDefs?: Definitions<T, C, K>
) => {
    const mergedDefs = Object.assign({}, prevDefs, buildingDefs);
    return {
        createService: (defs: Definitions<T, C, K>) => createService(Object.assign({}, defs, mergedDefs)),
        buildService: (defs: Definitions<T, C, K>) => buildService(defs, mergedDefs),
    };
};
