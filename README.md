[![Build Status](https://travis-ci.org/scottohara/loot.svg)](https://travis-ci.org/scottohara/loot)
[![Code Climate](https://codeclimate.com/github/scottohara/loot/badges/gpa.svg)](https://codeclimate.com/github/scottohara/loot)
[![Test Coverage](https://codeclimate.com/github/scottohara/loot/badges/coverage.svg)](https://codeclimate.com/github/scottohara/loot)
[![Dependency Status](https://www.versioneye.com/user/projects/549d100c6b1b81d9a4000925/badge.svg?style=flat)](https://www.versioneye.com/user/projects/549d100c6b1b81d9a4000925)
[![Dependency Status](https://www.versioneye.com/user/projects/549d12836b1b81202d0005dc/badge.svg?style=flat)](https://www.versioneye.com/user/projects/549d12836b1b81202d0005dc)

Description
===========
Loot is a web-based personal finance management application.
It's main goal is to reproduce the core functionality of Microsoft Money 2008, for the web.

Rails on the backend (JSON API); Angular.js + Bootstrap on the frontend

Getting Started
===============
1. Clone the repository (`git clone git://github.com/scottohara/loot.git`) and switch to it (`cd loot`)
2. Install the server-side dependencies (`bundle install --path vendor/bundle`) (--path ensures that gems are installed locally in the project)
3. Install the client-side dev dependencies (`npm install`) (Note: you should have `./node_modules/.bin` in your shell path; so that locally installed packages are preferred over globally installed ones)
4. (Optional) Configure database.yml (uses postgres by default)
5. (Optional) Export your existing MS Money data (see below)
6. Initialise the database (`rake db:setup`, or if you have no data to import `rake db:create && rake db:migrate`)
7. Configure environment variables for the username and password to login as (`export LOOT_USERNAME=user && export LOOT_PASSWORD=pass`)
8. Start the database server and app server in dev mode (`heroku local -f Procfile.dev`)
9. Browse to http://localhost:8080/index.html and login using the credentials configured at step #8

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
Run `gulp build`, which:

1. Concatenates `/src/**/*.js` => `app.js`, minifies it, fingerprints it, and writes it to `/public/app-{hash}.js` along with source maps
2. Concatenates 3rd-party vendor scripts => `vendor.js`, minifies it, fingerprints it, and writes it to `/public/vendor-{hash}.js` along with source maps
3. Compiles all `/src/**/*.less` files, concatenates to `app.css`, minifies it, fingerprints it, and writes it to `/public/app-{hash}.css` along with source maps
4. Concatenates 3rd-party vendor `*.css` => `vendor.css`, minifies it, fingerprints it, and writes it to `/public/vendor-{hash}.css` along with source maps
5. Copies any static assets (eg. fonts) to `/public`
6. Injects the fingerprinted file names into `index.html`

Running Tests
=============
Frontend specs are implemented using [mocha](http://mochajs.org/)+[chai](http://chaijs.com/)+[sinon](http://sinonjs.org/).

Three gulp tasks are available to run the frontend test suite:

1. `gulp test:bdd` (or simply `gulp`, as `test:bdd` is the default task) watches for any file changes and runs the full test suite
2. `gulp test:src` does the same, but includes [instanbul](http://gotwarlost.github.io/istanbul/) code coverage reporting. Summary coverage reports are written to stdout, and detailed HTML reports are available in `/loot/coverage/index.html`
3. `gulp test:build` does the same as `gulp test:src`, except it runs the test suite and coverage analysis against the built files in `/public` instead of against the original files

(Note: `gulp test:src` will be deprecated once instanbul & karma-coverage add proper support for source maps in the HTML reports)

Backend specs are implemented using [RSpec](http://rspec.info/):

1. Ensure the database server is running (e.g. `postgres -D /usr/local/var/postgres`)
2. Run the RSpec rake task (`rake spec`). To run specific specs, use RSpec filtering (`fdescribe`, `fit`, `xdescribe`, `xit`)

Integration tests are implemented using [Protractor](http://www.protractortest.org/#/):

1. Start the database server and app server in test mode (`heroku local -f Procfile.test`)
2. Prepare the test data fixtures (`rake db:e2e:prepare`)
3. Run the test suite (`protractor`). To run specific suites, use the `--suite` argument (e.g. `protractor --suite authentication,accounts`)

Code Quality
============
Frontend checks are implemented using [eslint](http://eslint.org):

1. `gulp eslint`

Backend checks are implemented using [rubocop](http://batsov.com/rubocop/):

1. `bundle exec rubocop`

Deployment (Staging/Production)
===============================
Before deploying, you should first create an annotated tag (e.g. `git tag -am "Version 1.00" v1.00`).

If you use use heroku, it's a simple `git push heroku master`. If there are additional commits after the tag that shouldn't be deployed, just push the tag (`git push heroku v1.00:master`).

The `Procfile` includes a `release` phase that automatically runs `db:migrate` before release is deployed.

If you use heroku pipelines, the recommendation is that your `heroku` git remote maps to a `staging` app in the pipeline. This allows you to verify the release before promoting it to a `production` app in the pipeline.

(Note: You must configure your heroku app to use the multi buildpack, eg. `heroku buildpack:set https://github.com/heroku/heroku-buildpack-multi`)

(Note: Ensure your server is configured to your local timezone. For heroku, this is done by setting the `TZ` config variable, eg. `heroku config:add TZ=Australia/Sydney`)
