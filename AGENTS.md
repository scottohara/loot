# Commands

## Backend

- Linting - `bundle exec rubocop`
- Run tests - `npm run rspec`
- Start database - `npm run db`
- Start server - `npm run api`
- Start server (test environment) - `npm run api:test`

Generally you'll want to use `npm run test:backend` which concurrently runs:

- `npm run db`
- `npm run rspec`

## Frontend

- Check formatting - `npm run format:check`
- Reformat - `npm run format`
- Linting - `npm run lint`
- Run tests - `npm run test:coverage`
- Start dev server - `npm run ui`
- Build - `npm run build`

Generally you'll want to use `npm test` which sequentially runs:

- `npm run format:check`
- `npm run lint`
- `npm run test:coverage`

## Full stack

- E2E tests (Cypress) - `npm run test:e2e`

Generally you'll want to use `npm start` which concurrently runs:

- `npm run api`
- `npm run db`
- `npm run ui`

# Stack

- Postgres
- Ruby on Rails (API mode)
- Angular.js + Typescript + CSS
- Rspec, FactoryBot, Rubocop
- Karma, Mocha, Sinon, Chai, ESLint, Prettier
- Cypress
- Webpack

# Architecture

- Single-user, after login credentials are stored in local storage and passed as basic auth in every API call

# Structure

## Backend

- Conventional Rails layout (`/app`, `/config`, `/spec`, etc.)

## Frontend

Each feature has its own directory.

Within a feature directory:

- `controllers` - Angular controllers
- `css` - CSS specific to the feature
- `models` - Angular models / API client
- `types` - Typescript definitions
- `views` - Angular view templates

# Conventions

- NEVER deploy
- 100% line/branch/function test coverage for both backend and frontend
- All observable effects of a function (including private ones) should have assertions.
- Examples of "observable effects" are return values, nested function calls, mutations visible outside of the scope of the function under test, HTTP requests, file operations etc.
- Code comments should not describe _what_ the code does, but _why_ it does it. Use comments sparingly and only where necessary. Follow established conventions for when a comment might be useful
- Don't write specs that test Rails built-in validations
