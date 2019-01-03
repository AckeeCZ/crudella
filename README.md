# Crudella

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
