import { Omit } from '../helpers';
import { Definitions } from '../settings/definitions';
import { CrudRepository } from '../settings/repository';
import { getDefaultController } from './controller';

const createDefaultImplementation = <T, C, K extends keyof T>(): Omit<
    Required<Definitions<T, C, K>>,
    'repository'
> => ({
    detail: () => Promise.reject(new Error('"detail" not implemented')),
    create: () => Promise.reject(new Error('"create" not implemented')),
    update: () => Promise.reject(new Error('"update" not implemented')),
    delete: () => Promise.reject(new Error('"delete" not implemented')),
    list: () => Promise.reject(new Error('"list" not implemented')),
    authorize: () => Promise.resolve(true),
    processData: data => data,
    postprocessData: returnValue => returnValue,
    createNotFoundError: () => new Error('Requested resource not found'),
    getOptions: () => ({}),
    controller: getDefaultController(),
    options: {},
    idKey: 'id' as any,
});

const createRepoImplementation = <T, C, K extends keyof T>(
    repo?: CrudRepository<T, K>,
    idKey?: K
    // tslint:disable-next-line max-union-size
): Pick<Required<Definitions<T, C, K>>, 'detail' | 'create' | 'update' | 'delete' | 'list'> | {} => {
    return repo && idKey
        ? {
            detail: ctx => repo.detailById(ctx.id, ctx.options),
            create: ctx => repo.create(ctx.data, ctx.options),
            update: ctx => repo.updateById(ctx.entity[idKey], ctx.data, ctx.options),
            delete: ctx => repo.deleteById(ctx.entity[idKey], ctx.options),
            list: ctx => repo.list(ctx.filters, ctx.options),
        }
        : {};
};

export const bootstrapConfiguration = <T, C extends object, K extends keyof T>(defs: Definitions<T, C, K>) =>
    Object.assign(
        {},
        createDefaultImplementation<T, C, K>(),
        createRepoImplementation<T, C, K>(defs.repository, defs.idKey),
        defs
    );
