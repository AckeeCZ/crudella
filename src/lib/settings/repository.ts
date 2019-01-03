export interface CrudRepository<T> {
    detailById: (id: number, options: any) => Promise<T>;
    create: (data: any, options: any) => Promise<T>;
    updateById: (id: number, data: any, options: any) => Promise<T>;
    deleteById: (id: number, options: any) => Promise<T>;
    list: (filters: any, options: any) => Promise<T[]>;
}
