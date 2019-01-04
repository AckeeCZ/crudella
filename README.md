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

Crudella is a service factory. It _creates_ your service module based on the minimal required configuration you provide.
Assume you have an entity repository (or any other CRUD interface for resource) and to make it work, you cannot simply bind it to routes, skipping through controller and service layer.
Here are several random problems you face in the mentioned layers:
 - User authorization
 - Request validation (this resource cannot be deleted, only some attributes can be updated etc.)
 - Data transformation (before creating or updating resource)
 - Verify that resource exists before update or delete
 - Pass custom HTTP context to the validation functions

Crudella implements logic equivalent of the controller and the service layer.
It goes as far as possible to help you with menial repeated code, but hopefully not as much as to completely take over your application and magically orchestrate behind your back.

Crudella helps you in various ways:
 - Remove lot of boilerplate code: This not only saves you work, but also gives you space to focus on the non-generic code.
 - Simplifies testing: Don't waste your time on running lengthy integration tests for boring CRUD over and over again. Test business logic, not boilerplate.
 - Separation of concerns: Do not mix your service logic with validation or authorization. Crudella encourages you to decouple your service logic from client validation and orchestrates the calls for you.

## Usage

Install via npm:
```
npm i crudella
```
Crudella is tested on several major Node.js [versions](https://travis-ci.com/AckeeCZ/crudella) starting at 6.

## Getting started


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

:information_source: Not using express? You can still use Crudella. See [generating handlers](./guide/handlers.md).

:information_source: This definition still feels too long and you have consistent repository API? See [configuring crudella using repository](./guide/repository.md).

## Advanced topics

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

### Other topics

 - [Data transformation](./guide/data-transformation.md)
 - [Configuring crudella using repository](./guide/repository.md)
 - [Generating handlers](./guide/handlers.md)
 - [Service builder and custom context](./guide/builder.md)
 - :construction: Dynamic options
 - [Custom 404 error](./guide/notfound.md)
 - :construction: Customize controller flow

## Development

#### Building

Run `npm run build` to compile Typescript into JavaScript.

#### Testing

Project uses [Jest](https://jestjs.io) testing framework and its snapshot testing.
Run `npm run test` to test or `npm run test:coverage` to collect coverage.

[Travis CI](https://travis-ci.com/AckeeCZ/crudella) tests PRs, [Coveralls](https://coveralls.io/github/AckeeCZ/crudella?branch=master) collect coverage.

#### Coding style

TS lint and prettier
`npm run lint`

#### Docs

To generate API docs using [TypeDoc](https://typedoc.org/) and preview locally, run `npm run docs`.
Output is an ignored `docs` folder.
Current API documentation is deployed by Travis via [GitHub Pages](https://pages.github.com/) :octocat:


## License

This project is licensed under [MIT](./LICENSE).
