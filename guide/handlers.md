# Generating handlers

Perhaps you don't want to use Express middleware but still want to use Crudella.
Well luckily it provides handler creators you can use and bind them yourself or use any other framework except express.

```typescript
// dalmatianService.ts
import { createService } from 'crudella';

const dalmatianService = createService<DalmatianAttributes>({
    // each method receives relevant CRUD context
    detail: ctx => dalmatianRepository.find(ctx.id, ctx.options),
    create: ctx => dalmatianRepository.create(ctx.data, ctx.options),
    update: ctx => dalmatianRepository.updateById(ctx.entity.id, ctx.data, ctx.options),
    delete: ctx => dalmatianRepository.deleteById(ctx.entity.id),
    list: ctx => dalmatianRepository.list(ctx.filters, ctx.options),
});

// dalmatianService.xxxHandler is a handler creator, called with optional options
export const dalmatianDetail = dalmatianService.detailHandler({ withRelated: withRelated.detail })
export const dalmatianCreate = dalmatianService.createHandler({ withRelated: withRelated.detail })
export const dalmatianUpdate = dalmatianService.updateHandler({ withRelated: withRelated.detail })
export const dalmatianDelete = dalmatianService.deleteHandler()
export const dalmatianList = dalmatianService.listHandler({ withRelated: withRelated.list })
```

No we have created a service exporting service-layer handlers for CRUD API on dalmatians.
Handlers are async and always return a promise with the result you provide from your bindings, or an error.
Here are are signatures of the service handlers (promise values depend on your implementation).
```typescript
dalmatianDetail: (id: number, context: C) => Promise<DalmatianAttributes>;
dalmatianCreate: (data: any, context: C) => Promise<DalmatianAttributes>;
dalmatianUpdate: (id: number, data: any, context: C) => Promise<DalmatianAttributes>;
dalmatianDelete: (id: number, context: C) => Promise<bool>;
dalmatianList: (filters: any, context: C) => Promise<DalmatianAttributes[]>;
```
The `C` type is any HTTP context you prefer to use, it can contain client parameters, user session etc.
