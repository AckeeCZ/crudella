import { Omit } from 'lodash';
import { CreateContext, DeleteContext, DetailContext, ListContext, UpdateContext } from './crudContext';
import { Operation } from './operation';

type StripConstants<T> = Omit<T, 'type' | 'write' | 'safe'>;

export const forgeDetailContext = <T, C, K extends keyof T>(
    vars: StripConstants<DetailContext<T, C, K>>
): DetailContext<T, C, K> => ({
    ...vars,
    type: Operation.DETAIL,
    write: false,
    safe: true,
});

export const forgeCreateContext = <T, C>(vars: StripConstants<CreateContext<T, C>>): CreateContext<T, C> => ({
    ...vars,
    type: Operation.CREATE,
    write: true,
    safe: false,
});

export const forgeUpdateContext = <T, C>(vars: StripConstants<UpdateContext<T, C>>): UpdateContext<T, C> => ({
    ...vars,
    data: Object.assign({}, vars.entity, vars.data),
    type: Operation.UPDATE,
    write: true,
    safe: false,
});

export const forgeDeleteContext = <T, C, K extends keyof T>(
    vars: StripConstants<DeleteContext<T, C, K>>
): DeleteContext<T, C, K> => ({
    ...vars,
    type: Operation.DELETE,
    write: false,
    safe: false,
});

export const forgeListContext = <T, C>(vars: StripConstants<ListContext<T, C>>): ListContext<T, C> => ({
    ...vars,
    type: Operation.LIST,
    write: false,
    safe: true,
});
