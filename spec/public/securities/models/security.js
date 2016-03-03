describe("securityModel", () => {
	let	securityModel,
			$httpBackend,
			$http,
			$cache,
			$window,
			ogLruCache;

	// Load the modules
	beforeEach(module("lootMocks", "lootSecurities", mockDependenciesProvider => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject(_$window_ => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentSecurities").returns(null);
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_securityModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) => {
		securityModel = _securityModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		const	$cacheFactory = _$cacheFactory_,
					ogLruCacheFactory = _ogLruCacheFactory_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory();
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach(() => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent securities from localStorage", () => $window.localStorage.getItem.should.have.been.calledWith("lootRecentSecurities"));

	it("should have a list of recent securities", () => {
		ogLruCache.list.should.have.been.called;
		securityModel.recent.should.equal("recent list");
	});

	describe("type", () => {
		it("should be 'security'", () => securityModel.type.should.equal("security"));
	});

	describe("path", () => {
		it("should return the securities collection path when an id is not provided", () => securityModel.path().should.equal("/securities"));

		it("should return a specific security path when an id is provided", () => securityModel.path(123).should.equal("/securities/123"));
	});

	describe("all", () => {
		let expectedUrl = /securities$/,
				expectedResponse = "securities without balances";

		it("should dispatch a GET request to /securities", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			securityModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			securityModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all securities without their balances", () => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			securityModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(include balances)", () => {
			beforeEach(() => {
				expectedUrl = /securities\?include_balances/;
				expectedResponse = "categories with children";
			});

			it("should dispatch a GET request to /securities?include_balances", () => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				securityModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", () => {
				const httpGet = sinon.stub($http, "get").returns({
					then() {
						// Do nothing
					}
				});

				securityModel.all(true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all securities including their balances", () => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				securityModel.all(true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", () => {
		const expected = "securities with balances";

		beforeEach(() => securityModel.all = sinon.stub().returns(expected));

		it("should call securityModel.all(true)", () => {
			securityModel.allWithBalances();
			securityModel.all.should.have.been.calledWith(true);
		});

		it("should return a list of all securities including their balances", () => securityModel.allWithBalances().should.equal(expected));
	});

	describe("findLastTransaction", () => {
		const expectedResponse = "last transaction";
		let actualResponse;

		beforeEach(() => {
			$httpBackend.expectGET(/securities\/123\/transactions\/last\?account_type=accountType$/).respond(200, expectedResponse);
			actualResponse = securityModel.findLastTransaction(123, "accountType");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /securities/{id}/transactions/last?account_type={accountType}", () => null);

		it("should return the last transaction for the security", () => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("find", () => {
		const expectedUrl = /securities\/123/,
					expectedResponse = "security details";

		beforeEach(() => securityModel.addRecent = sinon.stub());

		it("should dispatch a GET request to /securities/{id}", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			securityModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			securityModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the security to the recent list", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			securityModel.find(123);
			$httpBackend.flush();
			securityModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the security", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			securityModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", () => {
		beforeEach(() => {
			securityModel.flush = sinon.stub();
			$httpBackend.whenPOST(/securities$/, {}).respond(200);
			$httpBackend.whenPATCH(/securities\/123$/, {id: 123}).respond(200);
		});

		it("should flush the security cache", () => {
			securityModel.save({});
			securityModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /securities when an id is not provided", () => {
			$httpBackend.expectPOST(/securities$/);
			securityModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /securities/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/securities\/123$/);
			securityModel.save({id: 123});
			$httpBackend.flush();
		});
	});

	describe("destroy", () => {
		beforeEach(() => {
			securityModel.flush = sinon.stub();
			securityModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/securities\/123$/).respond(200);
			securityModel.destroy({id: 123});
			$httpBackend.flush();
		});

		it("should flush the security cache", () => securityModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /securities/{id}", () => null);

		it("should remove the securty from the recent list", () => securityModel.removeRecent.should.have.been.calledWith(123));
	});

	describe("flush", () => {
		it("should remove the specified security from the security cache when an id is provided", () => {
			securityModel.flush(1);
			$cache.remove.should.have.been.calledWith("/securities/1");
		});

		it("should flush the security cache when an id is not provided", () => {
			securityModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", () => {
		beforeEach(() => securityModel.addRecent("security"));

		it("should add the security to the recent list", () => {
			ogLruCache.put.should.have.been.calledWith("security");
			securityModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentSecurities", "{}"));
	});

	describe("removeRecent", () => {
		beforeEach(() => securityModel.removeRecent("security"));

		it("should remove the security from the recent list", () => {
			ogLruCache.remove.should.have.been.calledWith("security");
			securityModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentSecurities", "{}"));
	});
});
