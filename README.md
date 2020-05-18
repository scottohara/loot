| Service					| Status																																																																																					|
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub  				| [![Build Status](https://github.com/scottohara/loot/workflows/Build/badge.svg)](https://github.com/scottohara/loot/actions?workflow=Build)																																|
| Code Climate		| [![Code Climate](https://codeclimate.com/github/scottohara/loot/badges/gpa.svg)](https://codeclimate.com/github/scottohara/loot)																								|
| Code Climate		| [![Test Coverage](https://codeclimate.com/github/scottohara/loot/badges/coverage.svg)](https://codeclimate.com/github/scottohara/loot)																					|
| Snyk (npm)			| [![Known Vulnerabilities](https://snyk.io/test/github/scottohara/loot/badge.svg)](https://snyk.io/test/github/scottohara/loot)																									|
| Snyk (Gemfile)	| [![Known Vulnerabilities](https://snyk.io/test/github/scottohara/loot/badge.svg?targetFile=Gemfile.lock)](https://snyk.io/test/github/scottohara/loot?targetFile=Gemfile.lock)	|

Description
===========
Loot is a web-based personal finance management application.
Its main goal is to reproduce the core functionality of Microsoft Money 2008, for the web.

Rails on the backend (JSON API); Angular.js + Bootstrap on the frontend

Getting Started
===============
1. Clone the repository (`git clone git://github.com/scottohara/loot.git`) and switch to it (`cd loot`)
2. Install the server-side dependencies (`bundle config --local path vendor/bundle && bundle install`) (`path vendor/bundle` ensures that gems are installed locally in the project)
3. Install the client-side dev dependencies (`npm install`) (Note: you should have `./node_modules/.bin` in your shell path; so that locally installed packages are preferred over globally installed ones)
4. (Optional) Configure database.yml (uses postgres by default)
5. (Optional) Export your existing MS Money data (see below)
6. Initialise the database (`rake db:setup`, or if you have no data to import `rake db:create && rake db:migrate`)
7. Configure environment variables for the username and password to login as (`export LOOT_USERNAME=user && export LOOT_PASSWORD=pass`)
8. Start the database server and app server in dev mode (`npm start`)
9. Browse to http://localhost:5000/index.html and login using the credentials configured at step #8

Exporting MS Money data
=======================
To get data out of MS Money and into Loot, I'm using the excellent [Sunriise](http://sourceforge.net/projects/sunriise/) project to access the underlying data from my \*.mny file, and export it as a set of CSV files.

1. Download the latest [Sunriise](http://sourceforge.net/projects/sunriise/) build
2. Launch the executable JAR file
3. Choose the "MS Money file viewer" option
4. File -> Open -> {your *.mny file}
5. File -> Export DB -> To CSV
6. Save to ~/Documents/sunriise/csv
7. Run the importer (`rake db:seed`)

(Note: this import tool has been tested using my MS Money file only. YMMV.)

Building
========
`npm run build`

Running Tests
=============
Frontend specs are implemented using [mocha](http://mochajs.org/)+[chai](http://chaijs.com/)+[sinon](http://sinonjs.org/).

Two npm scripts are available to run the frontend test suite:

1. `npm run test:bdd` watches for any file changes and runs the full test suite (without code coverage)
2. `npm run test:coverage` performs a single full test suite run, including [instanbul](http://gotwarlost.github.io/istanbul/) code coverage reporting. Summary coverage reports are written to stdout, and detailed HTML reports are available in `/loot/coverage/index.html`

Backend specs are implemented using [RSpec](http://rspec.info/):

1. Ensure the database server is running (e.g. `npm start:db`)
2. Run the RSpec rake task (`rake spec`). To run specific specs, use RSpec filtering (`fdescribe`, `fit`, `xdescribe`, `xit`)

Integration tests are implemented using [Cypress](http://cypress.io/):

1. Start the database server and app server in test mode (`npm run test:e2e`)
2. Launch Cypress (`cypress open`) to run visually, or run in headless mode (`cypress run --browser chrome`)

Code Quality
============
Frontend checks are implemented using [eslint](http://eslint.org):

1. `npm run lint`

Backend checks are implemented using [rubocop](http://batsov.com/rubocop/):

1. `bundle exec rubocop -P`

Deployment (Staging/Production)
===============================
Before deploying, you should first create an annotated tag (e.g. `git tag -am "Version 1.00" v1.00`).

If you use use heroku, it's a simple `git push heroku master`. If there are additional commits after the tag that shouldn't be deployed, just push the tag (`git push heroku v1.00:master`).

The `Procfile` includes a `release` phase that automatically runs `db:migrate` before release is deployed.

If you use heroku pipelines, the recommendation is that your `heroku` git remote maps to a `staging` app in the pipeline. This allows you to verify the release before promoting it to a `production` app in the pipeline.

(Note: You must configure your heroku app to use the multi buildpack, e.g. `heroku buildpack:set https://github.com/heroku/heroku-buildpack-multi`)

(Note: Ensure your server is configured to your local timezone. For heroku, this is done by setting the `TZ` config variable, e.g. `heroku config:add TZ=Australia/Sydney`)
