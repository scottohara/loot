(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["accountMockProvider", "accountsMockProvider", "accountsWithBalancesMockProvider", "$qMockProvider"];

	/**
	 * Implementation
	 */
	function Provider(accountMockProvider, accountsMockProvider, accountsWithBalancesMockProvider, $qMockProvider) {
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
			type: sinon.stub().returns("account"),
			path: function(id) {
				return "/accounts/" + id;
			},
			recent: "recent accounts list",
			all: sinon.stub().returns(all()),
			allWithBalances: sinon.stub().returns(all(true)),
			find: sinon.stub().returns(accountMockProvider.$get()),
			addRecent: sinon.stub(),
			accounts: accountsWithBalancesMockProvider.$get(),
			reconcile: $q.promisify(),
			isUnreconciledOnly: sinon.stub().returns(true),
			unreconciledOnly: sinon.stub(),
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock accountModel object
			return provider.accountModel;
		};
	}
})();
