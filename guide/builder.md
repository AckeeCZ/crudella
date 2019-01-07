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

export default <T extends {id: any}, C = MyHttpContext>(defs: Definitions<T, C>) => buildService<T, C>({
    //                important part ^^^^^^^^^^^^^^^^^     use the same here ^             and here ^
    // some default behaviour can go here
}).createService(defs);
```


