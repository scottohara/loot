import type {
	CacheFactoryMock,
	WindowMock,
} from "~/mocks/node-modules/angular/types";
import type {
	OgLruCacheFactoryMock,
	OgLruCacheMock,
} from "~/mocks/og-components/og-lru-cache-factory/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import type { SinonStub } from "sinon";
import type { Transaction } from "~/transactions/types";
import angular from "angular";
import { createBasicTransaction } from "~/mocks/transactions/factories";
import createSecurity from "~/mocks/securities/factories";
import sinon from "sinon";

describe("securityModel", (): void => {
	let securityModel: SecurityModel,
		$httpBackend: angular.IHttpBackendService,
		$http: angular.IHttpService,
		$cache: angular.ICacheObject,
		$window: WindowMock,
		ogLruCache: OgLruCacheMock,
		security: Security,
		iPromise: angular.IPromise<never>,
		iHttpPromise: angular.IHttpPromise<unknown>;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootSecurities",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$cacheFactory",
					"$window",
					"ogLruCacheFactory",
					"iPromise",
					"iHttpPromise",
				]),
		) as Mocha.HookFunction,
	);

	// Inject any dependencies that need to be configured first
	beforeEach(
		angular.mock.inject((_$window_: WindowMock): void => {
			$window = _$window_;
			$window.localStorage.getItem
				.withArgs("lootRecentSecurities")
				.returns(null);
		}) as Mocha.HookFunction,
	);

	// Inject the object under test and it's remaining dependencies
	beforeEach(
		angular.mock.inject(
			(
				_securityModel_: SecurityModel,
				_$httpBackend_: angular.IHttpBackendService,
				_$http_: angular.IHttpService,
				$cacheFactory: CacheFactoryMock,
				ogLruCacheFactory: OgLruCacheFactoryMock,
				_iPromise_: angular.IPromise<never>,
				_iHttpPromise_: angular.IHttpPromise<unknown>,
			): void => {
				securityModel = _securityModel_;

				$httpBackend = _$httpBackend_;
				$http = _$http_;

				$cache = $cacheFactory();
				ogLruCache = ogLruCacheFactory.new();
				iPromise = _iPromise_;
				iHttpPromise = _iHttpPromise_;

				security = createSecurity({ id: 1 });
			},
		) as Mocha.HookFunction,
	);

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent securities from localStorage", (): Chai.Assertion =>
		expect($window.localStorage.getItem).to.have.been.calledWith(
			"lootRecentSecurities",
		));

	it("should have a list of recent securities", (): Chai.Assertion =>
		expect(securityModel.recent).to.deep.equal([
			{ id: 1, name: "recent item" },
		]));

	describe("LRU_LOCAL_STORAGE_KEY", (): void => {
		it("should be 'lootRecentSecurities'", (): Chai.Assertion =>
			expect(securityModel.LRU_LOCAL_STORAGE_KEY).to.equal(
				"lootRecentSecurities",
			));
	});

	describe("recentSecurities", (): void => {
		describe("when localStorage is not null", (): void => {
			let recentSecurities: OgCacheEntry[];

			beforeEach((): void => {
				recentSecurities = [{ id: 1, name: "recent item" }];
				$window.localStorage.getItem
					.withArgs("lootRecentSecurities")
					.returns(JSON.stringify(recentSecurities));
			});

			it("should return an array of cache entries", (): Chai.Assertion =>
				expect(securityModel["recentSecurities"]).to.deep.equal(
					recentSecurities,
				));
		});

		describe("when localStorage is null", (): void => {
			it("should return an empty array", (): Chai.Assertion =>
				expect(securityModel["recentSecurities"]).to.deep.equal([]));
		});
	});

	describe("type", (): void => {
		it("should be 'security'", (): Chai.Assertion =>
			expect(securityModel.type).to.equal("security"));
	});

	describe("path", (): void => {
		it("should return the securities collection path when an id is not provided", (): Chai.Assertion =>
			expect(securityModel.path()).to.equal("/securities"));
		it("should return a specific security path when an id is provided", (): Chai.Assertion =>
			expect(securityModel.path(123)).to.equal("/securities/123"));
	});

	describe("all", (): void => {
		let expectedUrl = /securities$/v,
			expectedResponse = "securities without balances";

		it("should dispatch a GET request to /securities", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			securityModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			securityModel.all();
			expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is
				.not.false;
		});

		it("should return a list of all securities without their balances", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
			securityModel
				.all()
				.then(
					(securities: Security[]): Chai.Assertion =>
						expect(securities).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});

		describe("(include balances)", (): void => {
			beforeEach((): void => {
				expectedUrl = /securities\?include_balances/v;
				expectedResponse = "securities with balances";
			});

			it("should dispatch a GET request to /securities?include_balances", (): void => {
				$httpBackend.expectGET(expectedUrl).respond(200);
				securityModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon
					.stub($http, "get")
					.returns(iHttpPromise);

				securityModel.all(true);
				expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is
					.false;
			});

			it("should return a list of all securities including their balances", (): void => {
				$httpBackend.whenGET(expectedUrl).respond(200, expectedResponse);
				securityModel
					.all(true)
					.then(
						(securities: Security[]): Chai.Assertion =>
							expect(securities).to.equal(expectedResponse),
					);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", (): void => {
		beforeEach(
			(): SinonStub => sinon.stub(securityModel, "all").returns(iPromise),
		);

		it("should call securityModel.all(true)", (): void => {
			securityModel.allWithBalances();
			expect(securityModel["all"]).to.have.been.calledWith(true);
		});

		it("should return a list of all securities including their balances", (): Chai.Assertion =>
			expect(securityModel.allWithBalances()).to.equal(iPromise));
	});

	describe("findLastTransaction", (): void => {
		it("should dispatch a GET request to /securities/{id}/transactions/last?account_type={accountType}", (): void => {
			$httpBackend
				.expectGET(/securities\/1\/transactions\/last\?account_type=bank$/v)
				.respond(200, {});
			securityModel.findLastTransaction(1, "bank");
			$httpBackend.flush();
		});

		it("should return the last transaction when there are transactions", (): void => {
			const lastTransaction = createBasicTransaction();

			$httpBackend
				.expectGET(/securities\/1\/transactions\/last\?account_type=bank$/v)
				.respond(200, lastTransaction);
			securityModel
				.findLastTransaction(1, "bank")
				.then(
					(transaction: Transaction): Chai.Assertion =>
						expect(transaction).to.deep.equal(lastTransaction),
				);
			$httpBackend.flush();
		});

		it("should return undefined when there are no transactions", (): void => {
			$httpBackend
				.expectGET(/securities\/1\/transactions\/last\?account_type=bank$/v)
				.respond(404, "");
			securityModel
				.findLastTransaction(1, "bank")
				.then(
					(transaction?: Transaction): Chai.Assertion =>
						expect(transaction).to.be.undefined,
				);
			$httpBackend.flush();
		});

		it("should throw an error when the GET request fails", (): void => {
			$httpBackend
				.expectGET(/securities\/1\/transactions\/last\?account_type=bank$/v)
				.respond(500, "Forced error", {}, "Internal Server Error");
			securityModel
				.findLastTransaction(1, "bank")
				.catch(
					(error: unknown): Chai.Assertion =>
						expect((error as Error).message).to.equal(
							"500 Internal Server Error: Forced error",
						),
				);
			$httpBackend.flush();
		});
	});

	describe("find", (): void => {
		const expectedUrl = /securities\/123/v,
			expectedResponse = "security details";

		beforeEach((): SinonStub => sinon.stub(securityModel, "addRecent"));

		it("should dispatch a GET request to /securities/{id}", (): void => {
			$httpBackend.expectGET(expectedUrl).respond(200);
			securityModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns(iHttpPromise);

			securityModel.find(123);
			expect(httpGet.firstCall.args[1]).to.have.own.property("cache").that.is
				.not.false;
		});

		it("should add the security to the recent list", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			securityModel.find(123);
			$httpBackend.flush();
			expect(securityModel["addRecent"]).to.have.been.calledWith(
				expectedResponse,
			);
		});

		it("should return the security", (): void => {
			$httpBackend.whenGET(expectedUrl).respond(expectedResponse);
			securityModel
				.find(123)
				.then(
					(foundSecurity: Security): Chai.Assertion =>
						expect(foundSecurity).to.equal(expectedResponse),
				);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		const expectedPostUrl = /securities$/v,
			expectedPatchUrl = /securities\/1$/v;

		beforeEach((): void => {
			sinon.stub(securityModel, "flush");
			$httpBackend.whenPOST(expectedPostUrl, security).respond(200);
			$httpBackend.whenPATCH(expectedPatchUrl, security).respond(200);
		});

		it("should flush the security cache", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
			securityModel.save(security);
			expect(securityModel["flush"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /securities when an id is not provided", (): void => {
			delete security.id;
			$httpBackend.expectPOST(expectedPostUrl);
			securityModel.save(security);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /securities/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(expectedPatchUrl);
			securityModel.save(security);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(securityModel, "flush");
			sinon.stub(securityModel, "removeRecent");
			$httpBackend.expectDELETE(/securities\/1$/v).respond(200);
			securityModel.destroy(security);
			$httpBackend.flush();
		});

		it("should flush the security cache", (): Chai.Assertion =>
			expect(securityModel["flush"]).to.have.been.called);

		it("should dispatch a DELETE request to /securities/{id}", (): null =>
			null);

		it("should remove the securty from the recent list", (): Chai.Assertion =>
			expect(securityModel["removeRecent"]).to.have.been.calledWith(1));
	});

	describe("toggleFavourite", (): void => {
		const expectedUrl = /securities\/1\/favourite$/v;

		beforeEach((): void => {
			sinon.stub(securityModel, "flush");
			$httpBackend.whenDELETE(expectedUrl).respond(200);
			$httpBackend.whenPUT(expectedUrl).respond(200);
		});

		it("should flush the security cache", (): void => {
			securityModel.toggleFavourite(security);
			expect(securityModel["flush"]).to.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /securities/{id}/favourite when the security is unfavourited", (): void => {
			$httpBackend.expectDELETE(expectedUrl);
			security.favourite = true;
			securityModel
				.toggleFavourite(security)
				.then(
					(favourite: boolean): Chai.Assertion => expect(favourite).to.be.false,
				);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /securities/{id}/favourite when the security is favourited", (): void => {
			$httpBackend.expectPUT(expectedUrl);
			securityModel
				.toggleFavourite(security)
				.then(
					(favourite: boolean): Chai.Assertion => expect(favourite).to.be.true,
				);
			$httpBackend.flush();
		});
	});

	describe("flush", (): void => {
		it("should remove the specified security from the security cache when an id is provided", (): void => {
			securityModel.flush(1);
			expect($cache["remove"]).to.have.been.calledWith("/securities/1");
		});

		it("should flush the security cache when an id is not provided", (): void => {
			securityModel.flush();
			expect($cache["removeAll"]).to.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => securityModel.addRecent(security));

		it("should add the security to the recent list", (): void => {
			expect(ogLruCache.put).to.have.been.calledWith(security);
			expect(securityModel.recent).to.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion =>
			expect($window.localStorage.setItem).to.have.been.calledWith(
				"lootRecentSecurities",
				JSON.stringify([{ id: 1, name: "recent item" }]),
			));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => securityModel.removeRecent(1));

		it("should remove the security from the recent list", (): void => {
			expect(ogLruCache.remove).to.have.been.calledWith(1);
			expect(securityModel.recent).to.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion =>
			expect($window.localStorage.setItem).to.have.been.calledWith(
				"lootRecentSecurities",
				JSON.stringify([{ id: 1, name: "recent item" }]),
			));
	});
});
