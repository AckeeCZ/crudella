# Data transformation

## `processData` (input transformation)
```typescript
const aggregateMuzzles = (pupper: DalmatianAttributes) => ({
    ...pupper,
    muzzleScore: pupper.muzzleLenght * pupper.age,
    muzzleCount: 1,
});

const defaultFilters = (filters: any) => ({
    ...filters,
    onlyGoodBoys: true,
})

const dalmatianService = createService<DalmatianAttributes>({
    create: ctx => dalmatianRepository.create(aggregateMuzzles(ctx.data), ctx.options),
    update: ctx => dalmatianRepository.updateById(ctx.entity.id, aggregateMuzzles(ctx.data), ctx.options),
    list: ctx => dalmatianRepository.list(defaultFilters(ctx.filters), ctx.options),
});
```

But thats boring, repetitive and you might forget to do that on update etc. Use `processData` instead.
If data transformation was the only reason not to use the [repository](./repository.md) shortcut, you can refactor the code a bit.

```typescript
const dalmatianService = createService<DalmatianAttributes>({
    repository: dalmatianRepository,
    processData: (data, ctx) => {
        if (ctx.type === Operation.CREATE || ctx.type === Operation.UPDATE) {
            return aggregateMuzzles(ctx.data);
        }
        if (ctx.type === Operation.LIST) {
            return defaultFilters(ctx.filters);
        }
        return data;
    },
});
```

processData is called for create, update and list.

## `postprocessData` (output transformation)

There is a similiar functino for an output transformation. Use it to decorate virtual/temporary data before sending to client.

```typescript
const decoratePuppy = (pupper: DalmatianAttributes) => ({
    ...pupper,
    leftHomeAt: new Date(),
});

const dalmatianService = createService<DalmatianAttributes>({
    repository: dalmatianRepository,
    postprocessData: (data, ctx) => {
        if (ctx.type === Operation.LIST) {
            return data.map(decoratePuppy);
        } else {
            return data && decoratePuppy(decoratePuppy);
        }
    },
});
```
