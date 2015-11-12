{
	/**
	 * Implementation
	 */
	class AuthenticationModelMockProvider {
		constructor($qMockProvider) {
			const $q = $qMockProvider.$get();

			// Mock authenticationModel object
			this.authenticationModel = {
				login: $q.promisify("gooduser", "baduser"),
				logout: sinon.stub(),
				isAuthenticated: true
			};
		}

		$get() {
			// Return the mock authenticationModel object
			return this.authenticationModel;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootAuthenticationMocks")
		.provider("authenticationModelMock", AuthenticationModelMockProvider);

	/**
	 * Dependencies
	 */
	AuthenticationModelMockProvider.$inject = ["$qMockProvider"];
}
