[![devDependency Status](https://david-dm.org/scottohara/loot/dev-status.svg)](https://david-dm.org/scottohara/loot#info=devDependencies)

Description
===========
Loot is a web-based personal finance management application.
It's main goal is to reproduce the core functionality of Microsoft Money 2008, for the web.

Rails on the backend (JSON-based API)
Angular.js + Bootstrap on the frontend

Getting Started
===============
1. Clone the repository (`git clone git://github.com/scottohara/loot.git`) and switch to it (`cd loot`)
2. Install the server-side dependencies (`bundle install`)
3. Install the client-side dev dependencies (`npm install`) (Note: you should have `./node_modules/.bin` in your shell path; so that locally installed packages are preferred over globally installed ones)
4. Install the client-side dependencies (`bower install`)
5. (Optional) Configure database.yml (uses postgres by default)
6. (Optional) Export your existing MS Money data (see below)
7. Initialise the database (`rake db:setup`, or if you have no data to import `rake db:create && rake db:migrate`)
8. Configure environment variables for the username and password to login as (`export LOOT_USERNAME=user && export LOOT_PASSWORD=pass`)
9. Start the server (`unicorn`)
10. Browse to http://localhost:8080/index.html and login using the credentials configured at step #5

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

Running Tests
=============
Frontend specs are implemented using [mocha](http://visionmedia.github.io/mocha/)+[chai](http://chaijs.com/)+[sinon](http://sinonjs.org/).
Two gulp tasks are available to run the test suite:
1. `gulp bdd` (or simply `gulp`, as `bdd` is the default task) watches for any file changes and runs the full test suite
2. `gulp test` does the same, but includes [instanbul](http://gotwarlost.github.io/istanbul/) code coverage reporting. Summary coverage reports are written to stdout, and detailed HTML reports are available in `/loot/coverage/index.html`
