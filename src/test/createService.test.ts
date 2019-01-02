import createService from 'lib/createService';

describe('createService', () => {
    test('Returns an object', () => {
        expect(typeof createService({})).toBe('object');
    });
});