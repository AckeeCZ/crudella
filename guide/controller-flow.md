# Customize controller flow

> I am writing a web app, where the hell are my request, response objects?

Crudella "implements" the service layer logic.
It is a good practice ([seperation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)), not to pollute your business logic with any details from the upper layers.
Crudella encourages you to use a _context_ to store required data from Request for instance, such as user data, header requested data format etc.

But it is true that you can use Crudella for controller layer, as seen in getting started guide, where middleware is created.
In that case, you need to decide what to put into your context.

For that you can use option object `controller`, which receives a service handler and creates a Request handler.
Freedom to define this logic is beneficial for:

1. Passing whatever you want as context
2. Creating custom controller-level handlers (serialize the result, catch errors etc.)


See the following example utilizing both:

```typescript
interface HttpError {
    code: number;
  message: string;
}
const catchHttpError = (res: Response) => (err: HttpError) => {
  res.status(err.code);
  res.json(err);
};
type MyContext = object;
const createContext = (req: Request): MyContext => ({});

export default <T extends { id: any }>(
  buildingDefs: Definitions<T, MyContext>
) =>
  buildService<T, MyContext>({
    controller: {
      detailAction: (handler, idName) => (req, res) =>
        handler(req.params[idName], createContext(req))
          .then(result => res.json(result))
          .catch(catchHttpError),
      createAction: handler => (req, res) =>
        handler(req.body, createContext(req))
          .then(result => res.json(result))
          .catch(catchHttpError),
      updateAction: (handler, idName) => (req, res) =>
        handler(req.params[idName], req.body, createContext(req))
          .then(result => res.json(result))
          .catch(catchHttpError),
      deleteAction: (handler, idName) => (req, res) =>
        handler(req.params[idName], createContext(req))
          .then(result => res.json(result))
          .catch(catchHttpError),
      listAction: handler => (req, res) =>
        handler(req.params, createContext(req))
          .then(result => res.json(result))
          .catch(catchHttpError),
    },
  }).createService(buildingDefs);
```

When using in application, this is likely to remain unchanged through the app.
Using [builder](./builder.md) is recommended.