require("babel-core/register");

module.exports.config = {

	// Connect directly to browsers
	directConnect: true,

	// Test suites
	suites: {
		authentication: "spec/public/authentication/views/*_spec.js",
		accounts: "spec/public/accounts/views/*_spec.js",
		categories: [
			"spec/public/categories/views/index_spec.js",
			"spec/public/categories/views/edit_spec.js",
			"spec/public/categories/views/delete_spec.js"
		],
		payees: [
			"spec/public/payees/views/index_spec.js",
			"spec/public/payees/views/edit_spec.js",
			"spec/public/payees/views/delete_spec.js"
		],
		securities: [
			"spec/public/securities/views/index_spec.js",
			"spec/public/securities/views/edit_spec.js",
			"spec/public/securities/views/delete_spec.js"
		],
		schedules: [
			"spec/public/schedules/views/index_spec.js",
			"spec/public/schedules/views/edit_spec.js"
		],
		transactions: [
			"spec/public/transactions/views/index_spec.js",
			"spec/public/transactions/views/edit_spec.js"
		]
	},

	// Base server URL
	baseUrl: "http://localhost:8080/index.html",

	// Timeouts
	allScriptsTimeout: 11000,
	getPageTimeout: 10000,

	// Initialise the mocha chai framework
	onPrepare() {
		// Load chai assertions
		const	chai = require("chai");

					// width = 1280,
					// height = 1024;

		// Load chai-as-promised support
		chai.use(require("chai-as-promised"));

		// Initialise should API (attaches as a property on Object)
		chai.should();

		// Copy the should property from Object to the protractor Promise
		// Reflect.defineProperty(protractor.promise.Promise.prototype, "should", Reflect.getOwnPropertyDescriptor(Object.prototype, "should"));
		Object.defineProperty(protractor.promise.Promise.prototype, "should", Object.getOwnPropertyDescriptor(Object.prototype, "should"));

		// Make sure the window is wide enough for the large bootstrap modals
		// browser.driver.manage().window().setSize(width, height);
	},

	/* eslint-disable no-process-env */
	params: {
		login: {
			userName: process.env.LOOT_USERNAME,
			password: process.env.LOOT_PASSWORD
		}
	},

	/* eslint-enable no-process-env */

	// Framework to use
	framework: "mocha",

	// Mocha options
	mochaOpts: {
		ui: "bdd",
		reporter: "spec",
		timeout: 30000
	}
};
