describe("accountModel", () => {
	let	accountModel,
			$httpBackend,
			$http,
			$cache,
			$window,
			ogLruCache;

	// Load the modules
	beforeEach(module("lootMocks", "lootAccounts", mockDependenciesProvider => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject(_$window_ => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentAccounts").returns(null);
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-123").returns("true");
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-456").returns("false");
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_accountModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) => {
		accountModel = _accountModel_;

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

	it("should fetch the list of recent accounts from localStorage", () => $window.localStorage.getItem.should.have.been.calledWith("lootRecentAccounts"));

	it("should have a list of recent accounts", () => {
		ogLruCache.list.should.have.been.called;
		accountModel.recent.should.equal("recent list");
	});

	describe("UNRECONCILED_ONLY_LOCAL_STORAGE_KEY", () => {
		it("should be 'lootUnreconciledOnly-'", () => accountModel.UNRECONCILED_ONLY_LOCAL_STORAGE_KEY.should.equal("lootUnreconciledOnly-"));
	});

	describe("LRU_LOCAL_STORAGE_KEY", () => {
		it("should be 'lootRecentAccounts'", () => accountModel.LRU_LOCAL_STORAGE_KEY.should.equal("lootRecentAccounts"));
	});

	describe("type", () => {
		it("should be 'account'", () => accountModel.type.should.equal("account"));
	});

	describe("path", () => {
		it("should return the accounts collection path when an id is not provided", () => accountModel.path().should.equal("/accounts"));

		it("should return a specific account path when an id is provided", () => accountModel.path(123).should.equal("/accounts/123"));
	});

	describe("all", () => {
		let expectedUrl = /accounts$/,
				expectedResponse = "accounts without balances";

		it("should dispatch a GET request to /accounts", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			accountModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			accountModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all accounts without their balances", () => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			accountModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(include balances)", () => {
			beforeEach(() => {
				expectedUrl = /accounts\?include_balances/;
				expectedResponse = "accounts with balances";
			});

			it("should dispatch a GET request to /accounts?include_balances", () => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				accountModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", () => {
				const httpGet = sinon.stub($http, "get").returns({
					then() {
						// Do nothing
					}
				});

				accountModel.all(true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all accounts including their balances", () => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				accountModel.all(true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", () => {
		const expected = "accounts with balances";

		beforeEach(() => accountModel.all = sinon.stub().returns(expected));

		it("should call accountModel.all(true)", () => {
			accountModel.allWithBalances();
			accountModel.all.should.have.been.calledWith(true);
		});

		it("should return a list of all accounts including their balances", () => {
			accountModel.allWithBalances().should.equal(expected);
		});
	});

	describe("find", () => {
		const expectedUrl = /accounts\/123/,
					expectedResponse = "account details";

		beforeEach(() => accountModel.addRecent = sinon.stub());

		it("should dispatch a GET request to /accounts/{id}", () => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			accountModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", () => {
			const httpGet = sinon.stub($http, "get").returns({
				then() {
					// Do nothing
				}
			});

			accountModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the account to the recent list", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			accountModel.find(123);
			$httpBackend.flush();
			accountModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the account", () => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			accountModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", () => {
		beforeEach(() => {
			accountModel.flush = sinon.stub();
			$httpBackend.whenPOST(/accounts$/, {}).respond(200);
			$httpBackend.whenPATCH(/accounts\/123$/, {id: 123}).respond(200);
		});

		it("should flush the account cache", () => {
			accountModel.save({});
			accountModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /accounts when an id is not provided", () => {
			$httpBackend.expectPOST(/accounts$/);
			accountModel.save({});
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /accounts/{id} when an id is provided", () => {
			$httpBackend.expectPATCH(/accounts\/123$/);
			accountModel.save({id: 123});
			$httpBackend.flush();
		});
	});

	describe("destroy", () => {
		beforeEach(() => {
			accountModel.flush = sinon.stub();
			accountModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/accounts\/123$/).respond(200);
			accountModel.destroy({id: 123});
			$httpBackend.flush();
		});

		it("should flush the account cache", () => accountModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /accounts/{id}", () => null);

		it("should remove the account from the recent list", () => accountModel.removeRecent.should.have.been.calledWith(123));
	});

	describe("reconcile", () => {
		const expectedUrl = /accounts\/123\/reconcile/;

		it("should dispatch a PUT request to /account/{id}/reconcile", () => {
			$httpBackend.expect("PUT", expectedUrl).respond(200);
			accountModel.reconcile(123);
			$httpBackend.flush();
		});
	});

	describe("toggleFavourite", () => {
		let account;

		beforeEach(() => {
			accountModel.flush = sinon.stub();
			$httpBackend.whenDELETE(/accounts\/123\/favourite$/).respond(200);
			$httpBackend.whenPUT(/accounts\/123\/favourite$/).respond(200);
			account = {id: 123};
		});

		it("should flush the account cache", () => {
			accountModel.toggleFavourite(account);
			accountModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /accounts/{id}/favourite when the account is unfavourited", () => {
			$httpBackend.expectDELETE(/accounts\/123\/favourite$/);
			account.favourite = true;
			accountModel.toggleFavourite(account).should.eventually.equal(false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /accounts/{id}/favourite when the account is favourited", () => {
			$httpBackend.expectPUT(/accounts\/123\/favourite$/);
			accountModel.toggleFavourite(account).should.eventually.equal(true);
			$httpBackend.flush();
		});
	});

	describe("isUnreconciledOnly", () => {
		it("should be true if the account is configured to show unreconciled transactions only", () => accountModel.isUnreconciledOnly(123).should.be.true);

		it("should be false if the account is not configured to show unreconciled transactions only", () => accountModel.isUnreconciledOnly(456).should.be.false);
	});

	describe("unreconciledOnly", () => {
		it("should save the unreconciledOnly setting for the specified account", () => {
			accountModel.unreconciledOnly(123, true);
			$window.localStorage.setItem.should.have.been.calledWith("lootUnreconciledOnly-123", true);
		});
	});

	describe("flush", () => {
		it("should remove the specified account from the account cache when an id is provided", () => {
			accountModel.flush(1);
			$cache.remove.should.have.been.calledWith("/accounts/1");
		});

		it("should flush the account cache when an id is not provided", () => {
			accountModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", () => {
		beforeEach(() => accountModel.addRecent("account"));

		it("should add the account to the recent list", () => {
			ogLruCache.put.should.have.been.calledWith("account");
			accountModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentAccounts", "{}"));
	});

	describe("removeRecent", () => {
		beforeEach(() => accountModel.removeRecent("account"));

		it("should remove the account from the recent list", () => {
			ogLruCache.remove.should.have.been.calledWith("account");
			accountModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", () => $window.localStorage.setItem.should.have.been.calledWith("lootRecentAccounts", "{}"));
	});
});
