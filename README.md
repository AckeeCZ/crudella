<p align="center">
  <img src="https://www.publicdomainpictures.net/pictures/270000/velka/dog-paint-splatter-illustration.jpg" height="170" width="170"/>
</p>

# Crudella

[![Build Status](https://img.shields.io/travis/com/AckeeCZ/crudella/master.svg?style=flat-square)](https://travis-ci.com/AckeeCZ/crudella)
[![Coverage Status](https://img.shields.io/coveralls/github/AckeeCZ/crudella.svg?style=flat-square)](https://coveralls.io/github/AckeeCZ/crudella?branch=master)
[![Dependency Status](https://img.shields.io/david/AckeeCZ/crudella.svg?style=flat-square)](https://david-dm.org/AckeeCZ/crudella)
[![Npm](https://img.shields.io/npm/v/crudella.svg?style=flat-square)](https://www.npmjs.com/package/crudella)
[![Types](https://img.shields.io/npm/types/crudella.svg?style=flat-square)](https://www.npmjs.com/package/crudella)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Docs](https://img.shields.io/badge/docs-typedoc-lightgrey.svg?style=flat-square)](https://ackeecz.github.io/crudella)
[![License](https://img.shields.io/github/license/AckeeCZ/crudella.svg?style=flat-square)](https://github.com/AckeeCZ/crudella/blob/master/LICENSE)

Tool for developing generic service layer for RESTful CRUD API in your Node.js backend application.

## Why Crudella

Assume we have an entity repository (or any other interface for REST resource, allowing us to implement CRUD operations), we cannot just bind it to express routes.
Here are several random problems we might face:
 - User authorization
 - Request validation (this resource cannot be deleted, only some attributes can be updated etc.)
 - Data transformation (before creating or updating resource)
 - Verify that resource exists before update or delete
 - Pass custom HTTP context to the validation functions

Crudella goes as far as possible to help you with menial repeated code, but hopefully not as far as to completely take over your application and magically orchestrate behind your back.
It helps you to remove lot of boilerplate code, allowing you to test the parts of your application that matter instead of writing lengthy integration tests for boring CRUD and helps you decouple manipulation with the storage (database repository) from business logic (validation, authorization etc.), leading to more organized code.

## Usage

Install via npm:
```
npm i crudella
```
Crudella is tested on several major Node.js [versions](https://travis-ci.com/AckeeCZ/crudella) starting at 6.

## Getting started

Crudella is a service factory. It _creates_ your service module based on the minimal required configuration you provide.

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

export const createPupperMiddleware = dalmatianService.createMiddleware;
```

Based on that Crudella provides an express middleware you can use without further hassle:

```typescript
// routes.ts
import { createPupperMiddleware } from 'dalmatianService';

const router = createRouter();
router.use(createPupperMiddleware('/api/puppies'))
```

That saved us some time. We don't have to bind the routes ourselves.
More importantly though, we can control the flow using rich contextual data. See [authorization](#authorization).

Not using express? You can still use Crudella to save you some time. See [generating handlers](#generating-handlers).

## Advanced topics

### Generating handlers
See the following example to learn how to use it to create service handlers, binding your data repository methods to Crudella.

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

// dalmatianService.xxxHandler is a handler creator, called with options
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

It does not do much yet apart from passing options for now (but it provides a uniform interface :point_up:), but let's check [authorization](./authorization).


### Authorization

Crudella allows you to decouple pure data manipulation (persisting puppies) from request verification.
Use `authorize` option with rich contextual data to reject access due to validation / authorization and do not pollute logic of manipulating objects with unrelated code.

```typescript
import { Access, createService } from 'crudella';

const dalmatianService = createService<DalmatianAttributes>({
    // ...all crud methods
    authorize: async ctx => {
        // reject anonymous users for all actions (detail, create, update, delete, list)
        // ctx.context is type of C, which you can set for your application
        if (!ctx.context.user) {
            throw new Error('Anonymous cannot see, delete, update or create dalmatians')
        }
        // reject for selected operations
        if (ctx.type === Access.LIST && 'dots' in filters) {
            throw new Error('Is rude to filter using dots!')
        }
        if (ctx.type === Access.CREATE && !isValidPuppy(ctx.data)) {
            throw new Error('Your puppy is invalid, sorry.')
        }
        // ctx contains all you need for validation and authorization
        if (ctx.type === Access.UPDATE) {
            if (!age in ctx.bareData) { // only data sent by client
                throw new Error('Age missing on update')
            }
            if (!isValidPuppy(ctx.data)) { // new data defaulted to existing entity
                throw new Error('Validation failed')
            }
        }
    },
});
```

For full reference of the contexts, see [API docs](https://ackeecz.github.io/interfaces/basecrudcontext.html).


### Data transformation

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

### Repository

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


## Development

### Building

Run `npm run build` to compile Typescript into JavaScript.

### Testing

Project uses [Jest](https://jestjs.io) testing framework and its snapshot testing.
Run `npm run test` to test or `npm run test:coverage` to collect coverage.

[Travis CI](https://travis-ci.com/AckeeCZ/crudella) tests PRs, [Coveralls](https://coveralls.io/github/AckeeCZ/crudella?branch=master) collect coverage.

### Coding style

TS lint and prettier
`npm run lint`

### Docs

To generate API docs using [TypeDoc](https://typedoc.org/) and preview locally, run `npm run docs`.
Output is an ignored `docs` folder.
Current API documentation is deployed by Travis via [GitHub Pages](https://pages.github.com/) :octocat:


## License

This project is licensed under [MIT](./LICENSE).
