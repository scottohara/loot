(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountModelMock", Provider);

	/**
	 * Implementation
	 */
	function Provider(accountMockProvider, accountsMockProvider, accountsWithBalancesMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get(),
				all,
				allWithBalances;

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: accountMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};

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
			type: sinon.stub().returns("account"),
			path: function(id) {
				return "/accounts/" + id;
			},
			recent: "recent accounts list",
			all: sinon.stub().returns(all()),
			allWithBalances: sinon.stub().returns(all(true)),
			find: function(id) {
				// Get the matching account
				var account = accountsMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the account
				return $q.promisify({response: account})();
			},
			addRecent: sinon.stub(),
			accounts: accountsWithBalancesMockProvider.$get(),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			reconcile: $q.promisify(),
			isUnreconciledOnly: sinon.stub().returns(true),
			unreconciledOnly: sinon.stub(),
			flush: sinon.stub()
		};

		// Spy on find()
		sinon.spy(provider.accountModel, "find");

		provider.$get = function() {
			// Return the mock accountModel object
			return provider.accountModel;
		};
	}
})();
