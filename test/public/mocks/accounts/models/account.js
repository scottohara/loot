(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accountsMocks");

	// Declare the accountModelMock provider
	mod.provider("accountModelMock", function() {
		var provider = this;

		// Mock accountModel object
		provider.accountModel = {
			recent: "recent accounts list",
			allWithBalances: sinon.stub().returns({
				then: function(callback) {
					callback(provider.accountModel.accounts);
				}
			}),
			accounts: {
				"bank": {total: 100},
				"investment": {total: 200},
				"liability": {total: -100}
			}
		};

		provider.$get = function() {
			// Return the mock accountModel object
			return provider.accountModel;
		};
	});

	// Declare the accountMock provider
	mod.provider("accountMock", function() {
		var provider = this;

		// Mock account object
		provider.account = {id: 1};

		provider.$get = function() {
			// Return the mock account object
			return provider.account;
		};
	});
})();
