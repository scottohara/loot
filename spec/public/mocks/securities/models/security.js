{
	/**
	 * Implementation
	 */
	class SecurityModelMockProvider {
		constructor(securityMockProvider, securitiesMockProvider, $qMockProvider) {
			// success/error = options for the stub promises
			const	success = {
							args: {id: 1},
							response: {data: securityMockProvider.$get()}
						},
						error = {
							args: {id: -1}
						},
						$q = $qMockProvider.$get();

			// Mock securityModel object
			this.securityModel = {
				path(id) {
					return `/securities/${id}`;
				},
				recent: "recent securities list",
				all: $q.promisify({
					response: securitiesMockProvider.$get()
				}),
				allWithBalances: sinon.stub().returns(securitiesMockProvider.$get()),
				find(id) {
					// Get the matching security
					const security = securitiesMockProvider.$get()[id - 1];

					// Return a promise-like object that resolves with the security
					return $q.promisify({response: security})();
				},
				findLastTransaction: $q.promisify({
					response: {}
				}, {
					args: -1
				}),
				save: $q.promisify(success, error),
				destroy: $q.promisify(success, error),
				toggleFavourite(security) {
					return $q.promisify({response: !security.favourite})();
				},
				flush: sinon.stub(),
				addRecent: sinon.stub()
			};

			// Spy on find() and toggleFavourite()
			sinon.spy(this.securityModel, "find");
			sinon.spy(this.securityModel, "toggleFavourite");
		}

		$get() {
			// Return the mock securityModel object
			return this.securityModel;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootSecuritiesMocks")
		.provider("securityModelMock", SecurityModelMockProvider);

	/**
	 * Dependencies
	 */
	SecurityModelMockProvider.$inject = ["securityMockProvider", "securitiesMockProvider", "$qMockProvider"];
}
