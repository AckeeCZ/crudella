import createService, { Operation } from 'lib/createService';

const entity = { id: 2, name: 'john' };
const fetchEntity = (data: any) => Promise.resolve({ ...entity, id: data.id });
const context = { user: 'Crudella de Vile' };
const options = { withRelated: ['dummy'] };
const filters = { nice: true };
const id = 5;
let get = jest.fn(fetchEntity);
describe('createService', () => {
    test('Returns an object', () => {
        expect(typeof createService({})).toBe('object');
    });
    describe('Basic handlers', () => {
        beforeEach(() => {
            get = jest.fn(fetchEntity);
        });
        test('Detail called once, when triggered, with correct attributes', async () => {
            const service = createService({ get });
            const getHandler = service.getHandler(options);
            expect(get).toHaveBeenCalledTimes(0);
            await expect(getHandler(id, context)).resolves.toHaveProperty('id', id);
            expect(get).toHaveBeenCalledTimes(1);
            expect(get.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Create', async () => {
            const create = jest.fn((ctx: any) => fetchEntity(ctx.data));
            const service = createService({ create });
            await expect(service.createHandler(options)({ id }, context)).resolves.toHaveProperty('id', id);
            expect(create).toHaveBeenCalledTimes(1);
            expect(create.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Update', async () => {
            const update = jest.fn((ctx: any) => fetchEntity(ctx.data));
            const service = createService({
                update,
                get,
            });
            await expect(service.updateHandler(options)(id, { id }, context)).resolves.toHaveProperty('id', id);
            // detail was called for context
            expect(get).toHaveBeenCalledTimes(1);
            expect(update).toHaveBeenCalledTimes(1);
            expect(update.mock.calls[0][0]).toMatchSnapshot();
        });
        test('Delete', async () => {
            const del = jest.fn().mockReturnValue(true);
            const service = createService({
                get,
                delete: del,
            });
            await expect(service.deleteHandler(options)(id, context)).resolves.toBe(true);
            // detail was called for context
            expect(get).toHaveBeenCalledTimes(1);
            expect(del).toHaveBeenCalledTimes(1);
            expect(del.mock.calls[0][0]).toMatchSnapshot();
        });
        test('List', async () => {
            const list = jest.fn().mockResolvedValue([]);
            const service = createService({ list });
            await expect(service.listHandler(options)(filters, context)).resolves.toEqual([]);
            expect(list.mock.calls[0][0]).toMatchSnapshot();
        });
    });
});
