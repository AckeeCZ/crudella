import { buildService } from 'lib/crudella';
import { CreateContext, createService, CrudContext, DeleteContext, ListContext, UpdateContext } from 'main';

interface PersonAttributes {
    id: number;
    name: string;
}
const entity: PersonAttributes = { id: 2, name: 'john' };
const fetchEntity = (data: any) => Promise.resolve({ ...entity, id: data.id });
const context = { user: 'Crudella de Vile', q: 'dalmatians' };
const options = { withRelated: ['dummy'] };
const filters = { nice: true };
const id = 5;
const createMethods = () => ({
    detail: jest.fn(fetchEntity),
    create: jest.fn((ctx: CreateContext<PersonAttributes, {}>) => Promise.resolve({ ...ctx.data, id: 5 })),
    update: jest.fn((ctx: UpdateContext<PersonAttributes, {}>) => Promise.resolve({ ...ctx.entity, ...ctx.bareData })),
    delete: jest.fn((ctx: DeleteContext<PersonAttributes, {}>) => Promise.resolve(true)),
    list: jest.fn((ctx: ListContext<PersonAttributes, {}>) => Promise.resolve(Array(3).fill(entity))),
    authorize: jest.fn((ctx: CrudContext<PersonAttributes, {}>) => true),
});
const createRepository = () => {
    const impl = createMethods();
    return {
        create: impl.create,
        deleteById: impl.delete,
        detailById: impl.detail,
        list: impl.list,
        updateById: impl.update,
    };
};
let methods = createMethods();
let repository = createRepository();

describe('createService', () => {
    test('Returns an object', () => {
        expect(typeof createService({})).toBe('object');
    });
    beforeEach(() => {
        methods = createMethods();
        repository = createRepository();
    });
    describe('Basic handlers', () => {
        beforeEach(() => {
            methods = createMethods();
        });
        test('Detail called once, when triggered, with correct attributes', async () => {
            const service = createService({ detail: methods.detail });
            const detailHandler = service.detailHandler(options);
            expect(methods.detail).toHaveBeenCalledTimes(0);
            await expect(detailHandler(id, context)).resolves.toMatchSnapshot();
            expect(methods.detail).toHaveBeenCalledTimes(1);
            expect(methods.detail.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Create', async () => {
            const service = createService({ create: methods.create });
            await expect(service.createHandler(options)({ id }, context)).resolves.toMatchSnapshot();
            expect(methods.create).toHaveBeenCalledTimes(1);
            expect(methods.create.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Update', async () => {
            const service = createService({
                detail: methods.detail,
                update: methods.update,
            });
            await expect(service.updateHandler(options)(id, { id }, context)).resolves.toMatchSnapshot();
            // detail was called for context
            expect(methods.detail).toHaveBeenCalledTimes(1);
            expect(methods.update).toHaveBeenCalledTimes(1);
            expect(methods.update.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Delete', async () => {
            const service = createService({
                detail: methods.detail,
                delete: methods.delete,
            });
            await expect(service.deleteHandler(options)(id, context)).resolves.toBe(true);
            // detail was called for context
            expect(methods.detail).toHaveBeenCalledTimes(1);
            expect(methods.delete).toHaveBeenCalledTimes(1);
            expect(methods.delete.mock.calls[0][0]).toMatchSnapshot();
        });
        test('List', async () => {
            const service = createService({ list: methods.list });
            await expect(service.listHandler(options)(filters, context)).resolves.toMatchSnapshot();
            expect(methods.list.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Repository implementation', async () => {
            const service = createService({ repository });
            await expect(service.detailHandler()(id, context)).resolves;
            await expect(service.createHandler()(entity, context)).resolves;
            await expect(service.listHandler()(filters, context)).resolves;
            await expect(service.updateHandler()(id, entity, context)).resolves;
            await expect(service.deleteHandler()(id, context)).resolves;
        });
    });
    describe('Authorization', () => {
        test('Called for every access with correct contexts', async () => {
            const service = createService(methods);
            await service.detailHandler()(id, context);
            expect(methods.authorize).toHaveBeenCalledTimes(1);
            await service.createHandler()(entity, context);
            expect(methods.authorize).toHaveBeenCalledTimes(2);
            await service.updateHandler()(id, entity, context);
            expect(methods.authorize).toHaveBeenCalledTimes(3);
            await service.deleteHandler()(id, context);
            expect(methods.authorize).toHaveBeenCalledTimes(4);
            await service.listHandler()(filters, context);
            expect(methods.authorize).toHaveBeenCalledTimes(5);
            expect(methods.authorize.mock.calls.map(x => x[0].type)).toMatchSnapshot();
        });
        test('Protected methods not called, handlers error', async () => {
            const service = createService({
                ...methods,
                authorize: () => Promise.reject(new Error()),
            });
            await expect(service.detailHandler()(id, context)).rejects.toBeInstanceOf(Error);
            await expect(service.createHandler()(entity, context)).rejects.toBeInstanceOf(Error);
            await expect(service.updateHandler()(id, entity, context)).rejects.toBeInstanceOf(Error);
            await expect(service.deleteHandler()(id, context)).rejects.toBeInstanceOf(Error);
            await expect(service.listHandler()(filters, context)).rejects.toBeInstanceOf(Error);
            // get, update, delete (contexts)
            expect(methods.detail).toHaveBeenCalledTimes(3);
            // skipped
            expect(methods.create).toHaveBeenCalledTimes(0);
            expect(methods.update).toHaveBeenCalledTimes(0);
            expect(methods.delete).toHaveBeenCalledTimes(0);
            expect(methods.list).toHaveBeenCalledTimes(0);
        });
    });
    describe('Unimplemented handlers error', () => {
        test('Direct implementation', async () => {
            const service = createService({});
            await expect(service.detailHandler()(id, context)).rejects.toThrow(/not implemented/);
            await expect(service.createHandler()(entity, context)).rejects.toThrow(/not implemented/);
            await expect(service.listHandler()(filters, context)).rejects.toThrow(/not implemented/);
            // Update and delete call get, test if fail even when get implemented
            const service2 = createService({ detail: methods.detail });
            await expect(service2.updateHandler()(id, entity, context)).rejects.toThrow(/not implemented/);
            await expect(service2.deleteHandler()(id, context)).rejects.toThrow(/not implemented/);
        });
    });
    describe('Not found', () => {
        test('Default error', async () => {
            const service = createService({ detail: jest.fn().mockResolvedValue(null) });
            await expect(service.detailHandler()(id, context)).rejects.toThrow(/not found/);
        });
        test('Custom error', async () => {
            const customError = new RangeError('Foo');
            const service = createService({
                repository,
                detail: jest.fn().mockResolvedValue(null),
                createNotFoundError: jest.fn().mockReturnValue(customError),
            });
            await expect(service.detailHandler()(id, context)).rejects.toBe(customError);
        });
    });
    describe('Options', () => {
        test('Dynamic options can react to operation', async () => {
            const service = createService({
                detail: methods.detail,
                update: methods.update,
                getOptions: op => ({
                    dynamicOption: op,
                }),
            });
            await service.detailHandler()(id, context);
            expect(methods.detail.mock.calls[0][0].options.dynamicOption).toMatchInlineSnapshot(`"DETAIL"`);
            await service.updateHandler()(id, {}, context);
            expect(methods.update.mock.calls[0][0].options.dynamicOption).toMatchInlineSnapshot(`"UPDATE"`);
        });
        test('Options cascade correctly', async () => {
            const service = createService({
                detail: methods.detail,
                getOptions: () => ({
                    dynamicOption: true,
                    dynamicAndContext: 'dynamic',
                    dynamicAndDirect: 'dynamic',
                }),
            });
            const httpContext = {
                contextOption: true,
                dynamicAndContext: 'context',
                directAndContext: 'context',
            };
            const directOptions = {
                dynamicAndDirect: 'direct',
                directAndContext: 'direct',
                directOption: true,
            };
            await service.detailHandler(directOptions)(id, httpContext);
            expect(methods.detail.mock.calls[0][0].options).toMatchSnapshot();
        });
    });
    describe('Builder', () => {
        test('Setting http context via builder', async () => {
            type DummyContext = [number, string];
            const serviceFactory = buildService<PersonAttributes, DummyContext>({}).createService;
            const service = serviceFactory({
                detail: methods.detail,
                authorize: ctx => {
                    const tryAssignContext: DummyContext = ctx.context;
                    return tryAssignContext;
                },
            });
        });
        test('Composition build', async () => {
            const serviceFactory = buildService({})
                .buildService({ create: methods.create })
                .buildService({ detail: methods.detail })
                .buildService({ delete: methods.delete })
                .buildService({ list: methods.list }).createService;
            const service = serviceFactory({});
            // All implemented resolved
            await expect(service.detailHandler()(id, context)).resolves.toBeTruthy();
            await expect(service.createHandler()(entity, context)).resolves.toBeTruthy();
            await expect(service.listHandler()(filters, context)).resolves.toBeTruthy();
            await expect(service.deleteHandler()(id, context)).resolves.toBeTruthy();
            // Missing is rejected
            await expect(service.updateHandler()(id, entity, context)).rejects.toBeInstanceOf(Error);
        });
    });
});
