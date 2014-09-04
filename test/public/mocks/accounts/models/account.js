(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accountsMocks");

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

	// Declare the accountsMock provider
	mod.provider("accountsMock", function() {
		var provider = this;

		// Mock accounts object
		provider.accounts = [
			{id: 1, name: "aa"},
			{id: 2, name: "bb", account_type: "investment"},
			{id: 3, name: "cc"},
			{id: 4, name: "ba"},
			{id: 5, name: "ab"},
			{id: 6, name: "bc", account_type: "investment"},
			{id: 7, name: "ca"},
			{id: 8, name: "cb"},
			{id: 9, name: "ac"}
		];

		provider.$get = function() {
			// Return the mock accounts object
			return provider.accounts;
		};
	});

	// Declare the accountsWithBalancesMock provider
	mod.provider("accountsWithBalancesMock", function() {
		var provider = this;

		// Mock accounts object
		provider.accounts = {
			"bank": {total: 100},
			"investment": {total: 200},
			"liability": {total: -100}
		};

		provider.$get = function() {
			// Return the mock accounts object
			return provider.accounts;
		};
	});

	// Declare the accountModelMock provider
	mod.provider("accountModelMock", function(accountMockProvider, accountsMockProvider, accountsWithBalancesMockProvider, $qMockProvider) {
		var provider = this,
				$q = $qMockProvider.$get(),
				all,
				allWithBalances;

		// Create a promise-like response for all()
		all = $q.promisify({
			response: accountsMockProvider.$get()
		});

		// Create a promise-like response for allWithBalances()
		allWithBalances = $q.promisify({
			response: accountsWithBalancesMockProvider.$get()
		});

		// Configure the different responses for all()
		all.withArgs(true).returns(allWithBalances());

		// Mock accountModel object
		provider.accountModel = {
			path: function(id) {
				return "/accounts/" + id;
			},
			recent: "recent accounts list",
			all: sinon.stub().returns(all()),
			allWithBalances: sinon.stub().returns(all(true)),
			find: sinon.stub().returns(accountMockProvider.$get()),
			addRecent: sinon.stub(),
			accounts: accountsWithBalancesMockProvider.$get(),
			isUnreconciledOnly: sinon.stub().returns(true),
			unreconciledOnly: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock accountModel object
			return provider.accountModel;
		};
	});
})();
