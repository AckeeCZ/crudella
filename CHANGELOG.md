# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2019-02-11
### Changed
- Add `bareData` to create context
- Fix prettier-husky-lint-staged config

### Fixed
- Missing inlined transitive dependency for `express-serve-static-core`

## [0.4.0] - 2019-01-29
### Added
- Option to select middleware routes based on the configuration

## [0.3.1] - 2019-01-15
### Changed
- The default type for context is empty object

### Fixed
- Api docs link in readme

## [0.3.0] - 2019-01-09
### Added
- Express middleware factory
- Controller interface and configuration
- User manual for controller flow

### Changed
- Use relative import paths (setting NODE_PATH is dirty for a library)
- Upgrade TS

### Fixed
- Incomplete assertions in some async tests
- Broken repository implementation in tests
- serviceBuilder export is now exported
- User manual for setting context via builder

## [0.2.0] - 2019-01-08
### Added
- User manual
- Polite readme
- Npm metadata
- Additional tests

## [0.1.0] - 2019-01-04
### Added
- Base implementation (contexts, def bootstrapping, handlers, factory, builder)
- Handlers + some minor tests
- Prettier, Husky

## [0.0.2] - 2019-01-02
### Fixed
- Deploy keys for GH, npm

## [0.0.1] - 2019-01-02
### Added
- Project template

[Unreleased]: https://github.com/AckeeCZ/crudella/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/AckeeCZ/crudella/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/AckeeCZ/crudella/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/AckeeCZ/crudella/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/AckeeCZ/crudella/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/AckeeCZ/crudella/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/AckeeCZ/crudella/compare/v0.0.2...v0.1.0
[0.0.2]: https://github.com/AckeeCZ/crudella/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/AckeeCZ/crudella/compare/41a6bfc...v0.0.1
