import { CreateContext, DeleteContext, DetailContext, ListContext, UpdateContext } from 'lib/context/crudContext';
import { Operation } from './operation';

export const forgeDetailContext = <T, C>(
    vars: Pick<DetailContext<T, C>, 'id' | 'entity' | 'context' | 'options'>
): DetailContext<T, C> => ({
    ...vars,
    type: Operation.DETAIL as Operation.DETAIL,
    write: false as false,
    safe: true as true,
});

export const forgeCreateContext = <T, C>(
    vars: Pick<CreateContext<T, C>, 'data' | 'context' | 'options'>
): CreateContext<T, C> => ({
    ...vars,
    type: Operation.CREATE as Operation.CREATE,
    write: true as true,
    safe: false as false,
});

export const forgeUpdateContext = <T, C>(
    vars: Pick<UpdateContext<T, C>, 'data' | 'bareData' | 'entity' | 'context' | 'options'>
): UpdateContext<T, C> => ({
    ...vars,
    data: Object.assign({}, vars.entity, vars.data),
    type: Operation.UPDATE as Operation.UPDATE,
    write: true as true,
    safe: false as false,
});

export const forgeDeleteContext = <T, C>(
    vars: Pick<DeleteContext<T, C>, 'id' | 'entity' | 'context' | 'options'>
): DeleteContext<T, C> => ({
    ...vars,
    type: Operation.DELETE as Operation.DELETE,
    write: false as false,
    safe: false as false,
});

export const forgeListContext = <T, C>(
    vars: Pick<ListContext<T, C>, 'filters' | 'context' | 'options'>
): ListContext<T, C> => ({
    ...vars,
    type: Operation.LIST,
    write: false as false,
    safe: true as true,
});
