# Service factory builder

For the practical convenience, Crudella provides a factory builder.
You can utilize it to create your custom factory for the project, _presetting_ all shared or desired default settings.


## Default implementation

Imagine you want to reject access by default, and allow it explicitly where needed.
You can create a custom factory to use throughout the application.


```typescript
import { buildService } from 'crudella';

const myServiceFactory = buildService({
    authorize: () => Promise.reject(new Error('Only true puppers can pass'))
}).createService;

export default myServiceFactory;
```
Using `authorize` option in `myServiceFactory` will overwrite existing implementation.


## Custom context
If you are using typescript, you can define your own http context interface via builder.
This interface is likely shared throughout your application, defining it in custom service factory is a good call.

```typescript
import { buildService } from 'crudella';

interface MyHttpContext {
    user: object;
    query: object;
    headers: object;
}

export default <T extends { id: any }>(defs: Definitions<T, MyHttpContext>) =>
  buildService<T, MyHttpContext>({ //        important part ^^^^^^^^^^^^^
    //  and here  ^^^^^^^^^^^^^
    // <-- some default behavior can go here, it is regular builder, just with a fixed template argument
  }).createService(defs);

```

That will do for the type.
But to see how to create the context in the "controller" using Crudella, read [customizing controller flow](./controller-flow.md).
