describe("payeeModel", () => {
	let	payeeModel,
			$httpBackend,
			$http,
			$cache,
			$window,
			ogLruCache;

	// Load the modules
	beforeEach(module("lootMocks", "lootPayees", mockDependenciesProvider => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject(_$window_ => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentPayees").returns(null);
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_payeeModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) => {
		payeeModel = _payeeModel_;

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

	it("should fetch the list of recent payees from localStorage", () => $window.localStorage.getItem.should.have.been.calledWith("lootRecentPayees"));

	it("should have a list of recent payees", () => {
		ogLruCache.list.should.have.been.called;
		payeeModel.recent.should.equal("recent list");
	});

	describe("type", () => {
		it("should be 'payee'", () => payeeModel.type.should.equal("payee"));
	});

	describe("path", () => {
		it("should return the payees collection path when an id is not provided", () => payeeModel.path().should.equal("/payees"));

		it("should return a specific payee path when an id is provided", () => payeeModel.path(123).should.equal("/payees/123"));
	});

	describe("all", () => {
		const expectedUrl = /payees$/,
					expectedResponse = "payees";

		it("should dispatch a GET request to /payees", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			payeeModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			payeeModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all payees", () => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			payeeModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("findLastTransaction", () => {
		const expectedResponse = "last transaction";
		let actualResponse;

		beforeEach(() => {
			$httpBackend.expectGET(/payees\/123\/transactions\/last\?account_type=accountType$/).respond(200, expectedResponse);
			actualResponse = payeeModel.findLastTransaction(123, "accountType");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /payees/{id}/transactions/last?account_type={accountType}", () => null);

		it("should return the last transaction for the payee", () => {
			actualResponse.should.eventually.equal(expectedResponse);
		});
	});

	describe("find", () => {
		const expectedUrl = /payees\/123/,
					expectedResponse = "payee details";

		beforeEach(() => payeeModel.addRecent = sinon.stub());

		it("should dispatch a GET request to /payees/{id}", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			payeeModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			payeeModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the payee to the recent list", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			payeeModel.find(123);
			$httpBackend.flush();
			payeeModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the payee", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			payeeModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", () => {
		beforeEach(() => {
			payeeModel.flush = sinon.stub();
			$httpBackend.whenPOST(/payees$/, {}).respond(200);
			$httpBackend.whenPATCH(/payees\/123$/, {id: 123}).respond(200);
		});

		it("should flush the payee cache", () => {
			payeeModel.save({});
			payeeModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /payees when an id is not provided", () => {
			$httpBackend.expectPOST(/payees$/);
			payeeModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /payees/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/payees\/123$/);
			payeeModel.save({id: 123});
			$httpBackend.flush();
		});
	});

	describe("destroy", () => {
		beforeEach(() => {
			payeeModel.flush = sinon.stub();
			payeeModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/payees\/123$/).respond(200);
			payeeModel.destroy({id: 123});
			$httpBackend.flush();
		});

		it("should flush the payee cache", () => payeeModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /payees/{id}", () => null);

		it("should remove the payee from the recent list", () => payeeModel.removeRecent.should.have.been.calledWith(123));
	});

	describe("flush", () => {
		it("should remove the specified payee from the payee cache when an id is provided", () => {
			payeeModel.flush(1);
			$cache.remove.should.have.been.calledWith("/payees/1");
		});

		it("should flush the payee cache when an id is not provided", () => {
			payeeModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", () => {
		beforeEach(() => payeeModel.addRecent("payee"));

		it("should add the payee to the recent list", () => {
			ogLruCache.put.should.have.been.calledWith("payee");
			payeeModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentPayees", "{}"));
	});

	describe("removeRecent", () => {
		beforeEach(() => payeeModel.removeRecent("payee"));

		it("should remove the payee from the recent list", () => {
			ogLruCache.remove.should.have.been.calledWith("payee");
			payeeModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentPayees", "{}"));
	});
});
