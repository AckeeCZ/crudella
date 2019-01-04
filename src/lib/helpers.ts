export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export const errorOrEmpty = (err: Error) => (res: any) => {
    if (!res) {
        throw err;
    }
    return res;
};
