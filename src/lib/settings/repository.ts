export interface CrudRepository<T> {
    detailById: (id: number, options: any) => PromiseLike<T>;
    create: (data: any, options: any) => PromiseLike<T>;
    updateById: (id: number, data: any, options: any) => PromiseLike<T>;
    deleteById: (id: number, options: any) => PromiseLike<any>;
    list: (filters: any, options: any) => PromiseLike<T[]>;
}
