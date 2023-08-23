import type {
	Account,
	Accounts
} from "~/accounts/types";
import type {
	CacheFactoryMock,
	WindowMock
} from "~/mocks/node-modules/angular/types";
import type {
	OgLruCacheFactoryMock,
	OgLruCacheMock
} from "~/mocks/og-components/og-lru-cache-factory/types";
import type AccountModel from "~/accounts/models/account";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type { SinonStub } from "sinon";
import angular from "angular";
import sinon from "sinon";

describe("accountModel", (): void => {
	let	accountModel: AccountModel,
			$httpBackend: angular.IHttpBackendService,
			$http: angular.IHttpService,
			$cache: angular.ICacheObject,
			$window: WindowMock,
			ogLruCache: OgLruCacheMock,
			account: Account,
			iPromise: angular.IPromise<never>,
			iHttpPromise: angular.IHttpPromise<unknown>;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory", "account", "iPromise", "iHttpPromise"])) as Mocha.HookFunction);

	// Inject any dependencies that need to be configured first
	beforeEach(angular.mock.inject((_$window_: WindowMock): void => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentAccounts").returns(null);
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-123").returns("true");
		$window.localStorage.getItem.withArgs("lootUnreconciledOnly-456").returns("false");
	}) as Mocha.HookFunction);

	// Inject the object under test and it's remaining dependencies
	beforeEach(angular.mock.inject((_accountModel_: AccountModel, _$httpBackend_: angular.IHttpBackendService, _$http_: angular.IHttpService, _$cacheFactory_: CacheFactoryMock, _ogLruCacheFactory_: OgLruCacheFactoryMock, _account_: Account, _iPromise_: angular.IPromise<never>, _iHttpPromise_: angular.IHttpPromise<unknown>): void => {
		accountModel = _accountModel_;
		$httpBackend = _$httpBackend_;
		$http = _$http_;
		account = _account_;
		iPromise = _iPromise_;
		iHttpPromise = _iHttpPromise_;

		const	$cacheFactory: CacheFactoryMock = _$cacheFactory_,
					ogLruCacheFactory: OgLruCacheFactoryMock = _ogLruCacheFactory_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory.new();
	}) as Mocha.HookFunction);

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent accounts from localStorage", (): Chai.Assertion => expect($window.localStorage.getItem).to.have.been.calledWith("lootRecentAccounts"));

	it("should have a list of recent accounts", (): Chai.Assertion => expect(accountModel.recent).to.deep.equal([{ id: 1, name: "recent item" }]));

	describe("UNRECONCILED_ONLY_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootUnreconciledOnly-'", (): Chai.Assertion => expect(accountModel["UNRECONCILED_ONLY_LOCAL_STORAGE_KEY"]).to.equal("lootUnreconciledOnly-"));
	});

	describe("LRU_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootRecentAccounts'", (): Chai.Assertion => expect(accountModel.LRU_LOCAL_STORAGE_KEY).to.equal("lootRecentAccounts"));
	});

	describe("recentAccounts", (): void => {
		describe("when localStorage is not null", (): void => {
			let recentAccounts: OgCacheEntry[];

			beforeEach((): void => {
				recentAccounts = [{ id: 1, name: "recent item" }];
				$window.localStorage.getItem.withArgs("lootRecentAccounts").returns(JSON.stringify(recentAccounts));
			});

			it("should return an array of cache entries", (): Chai.Assertion => expect(accountModel["recentAccounts"]).to.deep.equal(recentAccounts));
		});

		describe("when localStorage is null", (): void => {
			it("should return an empty array", (): Chai.Assertion => expect(accountModel["recentAccounts"]).to.deep.equal([]));
		});
	});

	describe("type", (): void => {
		it("should be 'account'", (): Chai.Assertion => expect(accountModel.type).to.equal("account"));
	});

	describe("path", (): void => {
		it("should return the accounts collection path when an id is not provided", (): Chai.Assertion => expect(accountModel.path()).to.equal("/accounts"));

		it("should return a specific account path when an id is provided", (): Chai.Assertion => expect(accountModel.path(123)).to.equal("/accounts/123"));
	});

	describe("all", (): void => {
		let expectedUrl = /accounts$/u,
				expectedResponse = "accounts without balances";

		it("should dispatch a GET request to /accounts", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			accountModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			accountModel.all();
			expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is.not.false;
		});

		it("should return a list of all accounts without their balances", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
			accountModel.all().then((accounts: Account[] | Accounts): Chai.Assertion => expect(accounts).to.equal(expectedResponse));
			$httpBackend.flush();
		});

		describe("(include balances)", (): void => {
			beforeEach((): void => {
				expectedUrl = /accounts\?include_balances/u;
				expectedResponse = "accounts with balances";
			});

			it("should dispatch a GET request to /accounts?include_balances", (): void => {
				$httpBackend.expectGET(expectedUrl).respond(200);
				accountModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

				accountModel.all(true);
				expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is.false;
			});

			it("should return a list of all accounts including their balances", (): void => {
				$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
				accountModel.all(true).then((accounts: Account[] | Accounts): Chai.Assertion => expect(accounts).to.equal(expectedResponse));
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", (): void => {
		beforeEach((): SinonStub => sinon.stub(accountModel, "all").returns(iPromise));

		it("should call accountModel.all(true)", (): void => {
			accountModel.allWithBalances();
			expect(accountModel["all"]).to.have.been.calledWith(true);
		});

		it("should return a list of all accounts including their balances", (): void => {
			expect(accountModel.allWithBalances()).to.equal(iPromise);
		});
	});

	describe("find", (): void => {
		const expectedUrl = /accounts\/123/u,
					expectedResponse = "account details";

		beforeEach((): SinonStub => sinon.stub(accountModel, "addRecent"));

		it("should dispatch a GET request to /accounts/{id}", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			accountModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			accountModel.find(123);
			expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is.not.false;
		});

		it("should add the account to the recent list", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			accountModel.find(123);
			$httpBackend.flush();
			expect(accountModel["addRecent"]).to.have.been.calledWith(expectedResponse);
		});

		it("should return the account", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			accountModel.find(123).then((foundAccount: Account): Chai.Assertion => expect(foundAccount).to.equal(expectedResponse));
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		const expectedPostUrl = /accounts$/u,
					expectedPatchUrl = /accounts\/1$/u;

		beforeEach((): void => {
			sinon.stub(accountModel, "flush");
			$httpBackend.whenPOST(expectedPostUrl, account).respond(200);
			$httpBackend.whenPATCH(expectedPatchUrl, account).respond(200);
		});

		it("should flush the account cache", (): void => {
			accountModel.save(account);
			expect(accountModel["flush"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /accounts when an id is not provided", (): void => {
			delete account.id;
			$httpBackend.expectPOST(expectedPostUrl);
			accountModel.save(account);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /accounts/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
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

		it("should flush the account cache", (): Chai.Assertion => expect(accountModel["flush"]).to.have.been.called);

		it("should dispatch a DELETE request to /accounts/{id}", (): null => null);

		it("should remove the account from the recent list", (): Chai.Assertion => expect(accountModel["removeRecent"]).to.have.been.calledWith(1));
	});

	describe("reconcile", (): void => {
		const expectedUrl = /accounts\/123\/reconcile/u;

		it("should dispatch a PUT request to /account/{id}/reconcile", (): void => {
			$httpBackend.expectPUT(expectedUrl).respond(200);
			accountModel.reconcile(123);
			$httpBackend.flush();
		});
	});

	describe("toggleFavourite", (): void => {
		const expectedUrl = /accounts\/1\/favourite$/u;

		beforeEach((): void => {
			sinon.stub(accountModel, "flush");
			$httpBackend.whenDELETE(expectedUrl).respond(200);
			$httpBackend.whenPUT(expectedUrl).respond(200);
		});

		it("should flush the account cache", (): void => {
			accountModel.toggleFavourite(account);
			expect(accountModel["flush"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /accounts/{id}/favourite when the account is unfavourited", (): void => {
			$httpBackend.expectDELETE(expectedUrl);
			account.favourite = true;
			accountModel.toggleFavourite(account).then((favourite: boolean): Chai.Assertion => expect(favourite).to.be.false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /accounts/{id}/favourite when the account is favourited", (): void => {
			$httpBackend.expectPUT(expectedUrl);
			accountModel.toggleFavourite(account).then((favourite: boolean): Chai.Assertion => expect(favourite).to.be.true);
			$httpBackend.flush();
		});
	});

	describe("isUnreconciledOnly", (): void => {
		it("should be true if the account is configured to show unreconciled transactions only", (): Chai.Assertion => expect(accountModel.isUnreconciledOnly(123)).to.be.true);

		it("should be false if the account is not configured to show unreconciled transactions only", (): Chai.Assertion => expect(accountModel.isUnreconciledOnly(456)).to.be.false);
	});

	describe("unreconciledOnly", (): void => {
		it("should save the unreconciledOnly setting for the specified account", (): void => {
			accountModel.unreconciledOnly(123, true);
			expect($window.localStorage.setItem).to.have.been.calledWith("lootUnreconciledOnly-123", "true");
		});
	});

	describe("flush", (): void => {
		it("should remove the specified account from the account cache when an id is provided", (): void => {
			accountModel.flush(1);
			expect($cache["remove"]).to.have.been.calledWith("/accounts/1");
		});

		it("should flush the account cache when an id is not provided", (): void => {
			accountModel.flush();
			expect($cache["removeAll"]).to.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => accountModel.addRecent(account));

		it("should add the account to the recent list", (): void => {
			expect(ogLruCache.put).to.have.been.calledWith(account);
			expect(accountModel.recent).to.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => expect($window.localStorage.setItem).to.have.been.calledWith("lootRecentAccounts", JSON.stringify([{ id: 1, name: "recent item" }])));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => accountModel.removeRecent(Number(account.id)));

		it("should remove the account from the recent list", (): void => {
			expect(ogLruCache.remove).to.have.been.calledWith(account.id);
			expect(accountModel.recent).to.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => expect($window.localStorage.setItem).to.have.been.calledWith("lootRecentAccounts", JSON.stringify([{ id: 1, name: "recent item" }])));
	});
});
