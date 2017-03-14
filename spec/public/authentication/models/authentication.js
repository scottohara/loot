describe("authenticationModel", () => {
	let	authenticationModel,
			$httpBackend,
			$http,
			$cacheFactory,
			$cache,
			$window;

	// Load the modules
	beforeEach(module("lootMocks", "lootAuthentication", mockDependenciesProvider => mockDependenciesProvider.load(["$cacheFactory", "$window"])));

	// Inject the object under test and the $httpBackend
	beforeEach(inject((_authenticationModel_, _$httpBackend_, _$http_, _$cacheFactory_, _$window_) => {
		authenticationModel = _authenticationModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		$cacheFactory = _$cacheFactory_;
		$cache = $cacheFactory();

		$window = _$window_;
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach(() => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	describe("SESSION_STORAGE_KEY", () => {
		it("should be 'lootAuthenticationKey'", () => authenticationModel.SESSION_STORAGE_KEY.should.equal("lootAuthenticationKey"));
	});

	describe("isAuthenticated", () => {
		let isAuthenticated;

		it("should fetch the authentication key from sessionStorage", () => {
			({isAuthenticated} = authenticationModel);
			$window.sessionStorage.getItem.should.have.been.calledWith("lootAuthenticationKey");
		});

		describe("when authenticated", () => {
			beforeEach(() => {
				$window.sessionStorage.getItem.returns("authentication key");
				({isAuthenticated} = authenticationModel);
			});

			it("should set the default $http Authorization header", () => $http.defaults.headers.common.Authorization.should.equal("Basic authentication key"));

			it("should be true", () => isAuthenticated.should.be.true);
		});

		describe("when not authenticated", () => {
			it("should be false", () => authenticationModel.isAuthenticated.should.be.false);
		});
	});

	describe("login", () => {
		beforeEach(() => {
			$httpBackend.expectPOST(/logins/, null, headers => "Basic base64 encoded" === headers.Authorization).respond(200, "authentication key");
			authenticationModel.login("username", "password");
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /logins, containing an Authorization header", () => null);

		it("should save the authentication key to sessionStorage", () => $window.sessionStorage.setItem.should.have.been.calledWith("lootAuthenticationKey", "base64 encoded"));

		it("should set the default $http Authorization header", () => $http.defaults.headers.common.Authorization.should.equal("Basic base64 encoded"));
	});

	describe("logout", () => {
		beforeEach(() => authenticationModel.logout());

		it("should remove the authentication key from sessionStorage", () => $window.sessionStorage.removeItem.should.have.been.calledWith("lootAuthenticationKey"));

		it("should clear the default $http Authorization header", () => $http.defaults.headers.common.Authorization.should.equal("Basic "));

		it("should clear all $http caches except the template cache", () => {
			$cache.removeAll.should.have.been.called;
			$cacheFactory.get("templates").removeAll.should.not.have.been.called;
		});
	});
});
