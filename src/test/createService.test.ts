import createService, { CreateContext, UpdateContext, DeleteContext } from 'lib/createService';

interface PersonAttributes {
    id: number;
    name: string;
}
const entity: PersonAttributes = { id: 2, name: 'john' };
const fetchEntity = (data: any) => Promise.resolve({ ...entity, id: data.id });
const context = { user: 'Crudella de Vile', q: 'dalmatins' };
const options = { withRelated: ['dummy'] };
const filters = { nice: true };
const id = 5;
const createMethods = () => ({
    get: jest.fn(fetchEntity),
    create: jest.fn((ctx: CreateContext<PersonAttributes, {}>) => Promise.resolve({ ...ctx.data, id: 5 })),
    update: jest.fn((ctx: UpdateContext<PersonAttributes, {}>) => Promise.resolve({ ...ctx.entity, ...ctx.bareData })),
    delete: jest.fn((ctx: DeleteContext<PersonAttributes, {}>) => Promise.resolve(true)),
    list: jest.fn((ctx: DeleteContext<PersonAttributes, {}>) => Promise.resolve(Array(3).fill(entity))),
});
let methods = createMethods();

describe('createService', () => {
    test('Returns an object', () => {
        expect(typeof createService({})).toBe('object');
    });
    describe('Basic handlers', () => {
        beforeEach(() => {
            methods = createMethods();
        });
        test('Detail called once, when triggered, with correct attributes', async () => {
            const service = createService({ get: methods.get });
            const getHandler = service.getHandler(options);
            expect(methods.get).toHaveBeenCalledTimes(0);
            await expect(getHandler(id, context)).resolves.toMatchSnapshot();
            expect(methods.get).toHaveBeenCalledTimes(1);
            expect(methods.get.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Create', async () => {
            const service = createService({ create: methods.create });
            await expect(service.createHandler(options)({ id }, context)).resolves.toMatchSnapshot();
            expect(methods.create).toHaveBeenCalledTimes(1);
            expect(methods.create.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Update', async () => {
            const service = createService({
                get: methods.get,
                update: methods.update,
            });
            await expect(service.updateHandler(options)(id, { id }, context)).resolves.toMatchSnapshot();
            // detail was called for context
            expect(methods.get).toHaveBeenCalledTimes(1);
            expect(methods.update).toHaveBeenCalledTimes(1);
            expect(methods.update.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Delete', async () => {
            const service = createService({
                get: methods.get,
                delete: methods.delete,
            });
            await expect(service.deleteHandler(options)(id, context)).resolves.toBe(true);
            // detail was called for context
            expect(methods.get).toHaveBeenCalledTimes(1);
            expect(methods.delete).toHaveBeenCalledTimes(1);
            expect(methods.delete.mock.calls[0][0]).toMatchSnapshot();
        });
        test('List', async () => {
            const service = createService({ list: methods.list });
            await expect(service.listHandler(options)(filters, context)).resolves.toMatchSnapshot();
            expect(methods.list.mock.calls[0][0]).toMatchSnapshot();
        });
    });
});
