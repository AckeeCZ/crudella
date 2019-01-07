# Data transformation

```typescript
const aggregateMuzzles = (pupper: DalmatianAttributes) => ({
    ...pupper,
    muzzleScore: pupper.muzzleLenght * pupper.age,
    muzzleCount: 1,
})

const dalmatianService = createService<DalmatianAttributes>({
    create: ctx => dalmatianRepository.create(aggregateMuzzles(ctx.data), ctx.options),
    update: ctx => dalmatianRepository.updateById(ctx.entity.id, aggregateMuzzles(ctx.data), ctx.options),
});
```

But thats boring, repetitive and you might forget to do that on update etc. Use `processData` instead.

```typescript
const aggregateMuzzles = /*...*/

const dalmatianService = createService<DalmatianAttributes>({
    create: ctx => dalmatianRepository.create(ctx.data, ctx.options),
    update: ctx => dalmatianRepository.updateById(ctx.entity.id, ctx.data, ctx.options),
    processData: ctx => aggregateMuzzles(ctx.data),
});
```
