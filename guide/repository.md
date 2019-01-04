# Repository

If you are using an existing ORM or any data layer with consistent API you can take a shortcut when defining a Crudella service, using an option `repository`.
Create a bridge function for you data abstraction layer.

```typescript
export const bridgeRepo = <T extends {id: any}>(repo: MyRepo<T>) => ({
    create: repo.create.withDetailById,
    deleteById: repo.deleteById,
    detailById: repo.detailById,
    list: repo.list,
    updateById: repo.updateById.withDetail,
});
```
Having this bridge function in your project, you can easily create CRUD services more consciously and focus on the hard stuff.

```typescript
const dalmatianService = createService<DalmatianAttributes>({
    repository: bridgeRepo(dalmatianRepository),
});
```
