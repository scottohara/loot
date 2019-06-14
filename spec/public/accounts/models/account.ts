import {
	CacheFactoryMock,
	WindowMock
} from "mocks/node-modules/angular/types";
import {
	OgLruCacheFactoryMock,
	OgLruCacheMock
} from "mocks/og-components/og-lru-cache-factory/types";
import sinon, {SinonStub} from "sinon";
import {Account} from "accounts/types";
import AccountModel from "accounts/models/account";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import angular from "angular";

describe("accountModel", (): void => {
	let	accountModel: AccountModel,
			$httpBackend: angular.IHttpBackendService,
			$http: angular.IHttpService,
			$cache: angular.ICacheObject,
			$window: WindowMock,
			ogLruCache: OgLruCacheMock,
			account: Account;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory", "account"])));

	// Inject any dependencies that need to be configured first
	beforeEach(angular.mock.inject((_$window_: WindowMock): void => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentAccounts").returns(null);
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-123").returns("true");
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-456").returns("false");
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_accountModel_: AccountModel, _$httpBackend_: angular.IHttpBackendService, _$http_: angular.IHttpService, _$cacheFactory_: CacheFactoryMock, _ogLruCacheFactory_: OgLruCacheFactoryMock, _account_: Account): void => {
		accountModel = _accountModel_;
		$httpBackend = _$httpBackend_;
		$http = _$http_;
		account = _account_;

		const	$cacheFactory: CacheFactoryMock = _$cacheFactory_,
					ogLruCacheFactory: OgLruCacheFactoryMock = _ogLruCacheFactory_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory.new();
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent accounts from localStorage", (): Chai.Assertion => $window.localStorage.getItem.should.have.been.calledWith("lootRecentAccounts"));

	it("should have a list of recent accounts", (): Chai.Assertion => accountModel.recent.should.deep.equal([{id: 1, name: "recent item"}]));

	describe("UNRECONCILED_ONLY_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootUnreconciledOnly-'", (): Chai.Assertion => accountModel["UNRECONCILED_ONLY_LOCAL_STORAGE_KEY"].should.equal("lootUnreconciledOnly-"));
	});

	describe("LRU_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootRecentAccounts'", (): Chai.Assertion => accountModel.LRU_LOCAL_STORAGE_KEY.should.equal("lootRecentAccounts"));
	});

	describe("type", (): void => {
		it("should be 'account'", (): Chai.Assertion => accountModel.type.should.equal("account"));
	});

	describe("path", (): void => {
		it("should return the accounts collection path when an id is not provided", (): Chai.Assertion => accountModel.path().should.equal("/accounts"));

		it("should return a specific account path when an id is provided", (): Chai.Assertion => accountModel.path(123).should.equal("/accounts/123"));
	});

	describe("all", (): void => {
		let expectedUrl = /accounts$/u,
				expectedResponse = "accounts without balances";

		it("should dispatch a GET request to /accounts", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			accountModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			accountModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all accounts without their balances", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			accountModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(include balances)", (): void => {
			beforeEach((): void => {
				expectedUrl = /accounts\?include_balances/u;
				expectedResponse = "accounts with balances";
			});

			it("should dispatch a GET request to /accounts?include_balances", (): void => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				accountModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon.stub($http, "get").returns({
					then(): void {
						// Do nothing
					}
				});

				accountModel.all(true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all accounts including their balances", (): void => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				accountModel.all(true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", (): void => {
		const expected = "accounts with balances";

		beforeEach((): SinonStub => sinon.stub(accountModel, "all").returns(expected));

		it("should call accountModel.all(true)", (): void => {
			accountModel.allWithBalances();
			accountModel.all.should.have.been.calledWith(true);
		});

		it("should return a list of all accounts including their balances", (): void => {
			accountModel.allWithBalances().should.equal(expected);
		});
	});

	describe("find", (): void => {
		const expectedUrl = /accounts\/123/u,
					expectedResponse = "account details";

		beforeEach((): SinonStub => sinon.stub(accountModel, "addRecent"));

		it("should dispatch a GET request to /accounts/{id}", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			accountModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			accountModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the account to the recent list", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			accountModel.find(123);
			$httpBackend.flush();
			accountModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the account", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			accountModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		beforeEach((): void => {
			sinon.stub(accountModel, "flush");
			$httpBackend.whenPOST(/accounts$/u, account).respond(200);
			$httpBackend.whenPATCH(/accounts\/1$/u, account).respond(200);
		});

		it("should flush the account cache", (): void => {
			accountModel.save(account);
			accountModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /accounts when an id is not provided", (): void => {
			delete account.id;
			$httpBackend.expectPOST(/accounts$/u);
			accountModel.save(account);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /accounts/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(/accounts\/1$/u);
			accountModel.save(account);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(accountModel, "flush");
			sinon.stub(accountModel, "removeRecent");
			$httpBackend.expectDELETE(/accounts\/1$/u).respond(200);
			accountModel.destroy(account);
			$httpBackend.flush();
		});

		it("should flush the account cache", (): Chai.Assertion => accountModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /accounts/{id}", (): null => null);

		it("should remove the account from the recent list", (): Chai.Assertion => accountModel.removeRecent.should.have.been.calledWith(1));
	});

	describe("reconcile", (): void => {
		const expectedUrl = /accounts\/123\/reconcile/u;

		it("should dispatch a PUT request to /account/{id}/reconcile", (): void => {
			$httpBackend.expect("PUT", expectedUrl).respond(200);
			accountModel.reconcile(123);
			$httpBackend.flush();
		});
	});

	describe("toggleFavourite", (): void => {
		beforeEach((): void => {
			sinon.stub(accountModel, "flush");
			$httpBackend.whenDELETE(/accounts\/1\/favourite$/u).respond(200);
			$httpBackend.whenPUT(/accounts\/1\/favourite$/u).respond(200);
		});

		it("should flush the account cache", (): void => {
			accountModel.toggleFavourite(account);
			accountModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /accounts/{id}/favourite when the account is unfavourited", (): void => {
			$httpBackend.expectDELETE(/accounts\/1\/favourite$/u);
			account.favourite = true;
			accountModel.toggleFavourite(account).should.eventually.equal(false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /accounts/{id}/favourite when the account is favourited", (): void => {
			$httpBackend.expectPUT(/accounts\/1\/favourite$/u);
			accountModel.toggleFavourite(account).should.eventually.equal(true);
			$httpBackend.flush();
		});
	});

	describe("isUnreconciledOnly", (): void => {
		it("should be true if the account is configured to show unreconciled transactions only", (): Chai.Assertion => accountModel.isUnreconciledOnly(123).should.be.true);

		it("should be false if the account is not configured to show unreconciled transactions only", (): Chai.Assertion => accountModel.isUnreconciledOnly(456).should.be.false);
	});

	describe("unreconciledOnly", (): void => {
		it("should save the unreconciledOnly setting for the specified account", (): void => {
			accountModel.unreconciledOnly(123, true);
			$window.localStorage.setItem.should.have.been.calledWith("lootUnreconciledOnly-123", "true");
		});
	});

	describe("flush", (): void => {
		it("should remove the specified account from the account cache when an id is provided", (): void => {
			accountModel.flush(1);
			$cache.remove.should.have.been.calledWith("/accounts/1");
		});

		it("should flush the account cache when an id is not provided", (): void => {
			accountModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => accountModel.addRecent(account));

		it("should add the account to the recent list", (): void => {
			ogLruCache.put.should.have.been.calledWith(account);
			accountModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentAccounts", JSON.stringify([{id: 1, name: "recent item"}])));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => accountModel.removeRecent(account.id));

		it("should remove the account from the recent list", (): void => {
			ogLruCache.remove.should.have.been.calledWith(account.id);
			accountModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentAccounts", JSON.stringify([{id: 1, name: "recent item"}])));
	});
});
