export interface CrudRepository<T, K extends keyof T> {
    detailById: (id: T[K], options: any) => PromiseLike<T>;
    create: (data: any, options: any) => PromiseLike<T>;
    updateById: (id: T[K], data: any, options: any) => PromiseLike<T>;
    deleteById: (id: T[K], options: any) => PromiseLike<any>;
    list: (filters: any, options: any) => PromiseLike<T[]>;
}
