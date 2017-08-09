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
		// Load chai assertions, chai-as-promised support, and initialise should API (attahces as a property on Object)
		require("chai").use(require("chai-as-promised")).should();
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
