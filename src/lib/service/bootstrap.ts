import { DataContext } from 'lib/context/crudContext';
import { Omit } from 'lib/helpers';
import { Definitions } from 'lib/settings/definitions';
import { CrudRepository } from 'lib/settings/repository';

const createDefaultImplementation = <T, C>(): Omit<Required<Definitions<T>>, 'repository'> => ({
    detail: () => Promise.reject(new Error('"detail" not implemented')),
    create: () => Promise.reject(new Error('"create" not implemented')),
    update: () => Promise.reject(new Error('"update" not implemented')),
    delete: () => Promise.reject(new Error('"delete" not implemented')),
    list: () => Promise.reject(new Error('"list" not implemented')),
    authorize: () => Promise.resolve(true),
    processData: ({ data }: DataContext<T, C>) => data,
    createNotFoundError: () => new Error('Requested resource not found'),
    getOptions: () => ({}),
});

const createRepoImplementation = <T extends { id: any }>(
    repo?: CrudRepository<T>
): Pick<Required<Definitions<T>>, 'detail' | 'create' | 'update' | 'delete' | 'list'> | {} => {
    return repo
        ? {
              detail: ctx => repo.detailById(ctx.id, ctx.options),
              create: ctx => repo.create(ctx.data, ctx.options),
              update: ctx => repo.updateById(ctx.entity.id, ctx.data, ctx.options),
              delete: ctx => repo.deleteById(ctx.entity.id, ctx.options),
              list: ctx => repo.list(ctx.filters, ctx.options),
          }
        : {};
};

export const bootstrapConfiguration = <T extends { id: any }, C extends object>(defs: Definitions<T>) =>
    Object.assign({}, createDefaultImplementation<T, C>(), createRepoImplementation<T>(defs.repository), defs);
