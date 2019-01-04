# Custom 404 error

Use `createNotFoundError` to throw custom error when resource is not returned by your detail implementation.

Since this error is likely the same throughout your application, consider using [Crudella factory builder](./builder.md).

```typescript
// dalmatianService.ts
import { createService } from 'crudella';
import { NotFound } from 'errors';

const dalmatianService = createService<DalmatianAttributes>({
    createNotFoundError: () => new NotFound(),
});
```