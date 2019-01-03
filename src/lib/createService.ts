import { bootstrapConfiguration } from './service/bootstrap';
import { createHandlers } from './service/handlers';
import { Definitions } from './settings/definitions';

const createService = <T extends { id: any }, C extends object>(defs: Definitions<T>) => {
    const implementation = bootstrapConfiguration<T, C>(defs);
    const handlers = createHandlers(implementation);

    return {
        ...implementation,
        ...handlers,
    };
};

export default createService;
export const buildService = <T extends { id: any }, C>(
    buildingDefs: Definitions<T, C>,
    prevDefs?: Definitions<T, C>
) => {
    const mergedDefs = Object.assign({}, prevDefs, buildingDefs);
    return {
        createService: (defs: Definitions<T, C>) => createService(Object.assign({}, defs, mergedDefs)),
        buildService: (defs: Definitions<T, C>) => buildService(defs, mergedDefs),
    };
};
