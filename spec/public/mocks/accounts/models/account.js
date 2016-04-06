{
	/**
	 * Implementation
	 */
	class AccountModelMockProvider {
		constructor(accountMockProvider, accountsMockProvider, accountsWithBalancesMockProvider, $qMockProvider) {
			// success/error = options for the stub promises
			// all/allWithBalances =  promise-like responses
			const success = {
							args: {id: 1},
							response: {data: accountMockProvider.$get()}
						},
						error = {
							args: {id: -1}
						},
						$q = $qMockProvider.$get(),
						all = $q.promisify({
							response: accountsMockProvider.$get()
						}),
						allWithBalances = $q.promisify({
							response: accountsWithBalancesMockProvider.$get()
						});

			// Configure the different responses for all()
			all.withArgs(true).returns(allWithBalances());

			// Mock accountModel object
			this.accountModel = {
				type: "account",
				path(id) {
					return `/accounts/${id}`;
				},
				recent: "recent accounts list",
				all: sinon.stub().returns(all()),
				allWithBalances: sinon.stub().returns(all(true)),
				find(id) {
					// Get the matching account
					const account = accountsMockProvider.$get()[id - 1];

					// Return a promise-like object that resolves with the account
					return $q.promisify({response: account})();
				},
				addRecent: sinon.stub(),
				accounts: accountsWithBalancesMockProvider.$get(),
				save: $q.promisify(success, error),
				destroy: $q.promisify(success, error),
				reconcile: $q.promisify(),
				toggleFavourite(account) {
					return $q.promisify({response: !account.favourite})();
				},
				isUnreconciledOnly: sinon.stub().returns(true),
				unreconciledOnly: sinon.stub(),
				flush: sinon.stub()
			};

			// Spy on find() and toggleFavourite()
			sinon.spy(this.accountModel, "find");
			sinon.spy(this.accountModel, "toggleFavourite");
		}

		// Return the mock accountModel object
		$get() {
			return this.accountModel;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAccountsMocks")
		.provider("accountModelMock", AccountModelMockProvider);

	/**
	 * Dependencies
	 */
	AccountModelMockProvider.$inject = ["accountMockProvider", "accountsMockProvider", "accountsWithBalancesMockProvider", "$qMockProvider"];
}
