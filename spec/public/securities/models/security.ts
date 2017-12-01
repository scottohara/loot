import {
	BasicTransaction,
	Transaction
} from "transactions/types";
import {
	CacheFactoryMock,
	WindowMock
} from "mocks/node-modules/angular/types";
import {
	OgLruCacheFactoryMock,
	OgLruCacheMock
} from "mocks/og-components/og-lru-cache-factory/types";
import sinon, {SinonStub} from "sinon";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {Security} from "securities/types";
import SecurityModel from "securities/models/security";
import angular from "angular";
import {createBasicTransaction} from "mocks/transactions/factories";
import createSecurity from "mocks/securities/factories";

describe("securityModel", (): void => {
	let	securityModel: SecurityModel,
			$httpBackend: angular.IHttpBackendService,
			$http: angular.IHttpService,
			$cache: angular.ICacheObject,
			$window: WindowMock,
			ogLruCache: OgLruCacheMock,
			security: Security;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$window_: WindowMock): void => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentSecurities").returns(null);
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_securityModel_: SecurityModel, _$httpBackend_: angular.IHttpBackendService, _$http_: angular.IHttpService, $cacheFactory: CacheFactoryMock, ogLruCacheFactory: OgLruCacheFactoryMock): void => {
		securityModel = _securityModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory.new();

		security = createSecurity({id: 1});
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent securities from localStorage", (): Chai.Assertion => $window.localStorage.getItem.should.have.been.calledWith("lootRecentSecurities"));

	it("should have a list of recent securities", (): Chai.Assertion => securityModel.recent.should.deep.equal([{id: 1, name: "recent item"}]));

	describe("type", (): void => {
		it("should be 'security'", (): Chai.Assertion => securityModel.type.should.equal("security"));
	});

	describe("path", (): void => {
		it("should return the securities collection path when an id is not provided", (): Chai.Assertion => securityModel.path().should.equal("/securities"));

		it("should return a specific security path when an id is provided", (): Chai.Assertion => securityModel.path(123).should.equal("/securities/123"));
	});

	describe("all", (): void => {
		let expectedUrl: RegExp = /securities$/,
				expectedResponse: string = "securities without balances";

		it("should dispatch a GET request to /securities", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			securityModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			securityModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all securities without their balances", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			securityModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(include balances)", (): void => {
			beforeEach((): void => {
				expectedUrl = /securities\?include_balances/;
				expectedResponse = "securities with balances";
			});

			it("should dispatch a GET request to /securities?include_balances", (): void => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				securityModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon.stub($http, "get").returns({
					then(): void {
						// Do nothing
					}
				});

				securityModel.all(true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all securities including their balances", (): void => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				securityModel.all(true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allWithBalances", (): void => {
		const expected: string = "securities with balances";

		beforeEach((): SinonStub => (securityModel.all = sinon.stub().returns(expected)));

		it("should call securityModel.all(true)", (): void => {
			securityModel.allWithBalances();
			securityModel.all.should.have.been.calledWith(true);
		});

		it("should return a list of all securities including their balances", (): Chai.Assertion => securityModel.allWithBalances().should.equal(expected));
	});

	describe("findLastTransaction", (): void => {
		const expectedResponse: BasicTransaction = createBasicTransaction();
		let actualResponse: angular.IPromise<Transaction>;

		beforeEach((): void => {
			$httpBackend.expectGET(/securities\/1\/transactions\/last\?account_type=bank$/).respond(200, expectedResponse);
			actualResponse = securityModel.findLastTransaction(1, "bank");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /securities/{id}/transactions/last?account_type={accountType}", (): null => null);

		it("should return the last transaction for the security", (): void => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("find", (): void => {
		const expectedUrl: RegExp = /securities\/123/,
					expectedResponse: string = "security details";

		beforeEach((): SinonStub => (securityModel.addRecent = sinon.stub()));

		it("should dispatch a GET request to /securities/{id}", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			securityModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			securityModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the security to the recent list", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			securityModel.find(123);
			$httpBackend.flush();
			securityModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the security", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			securityModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		beforeEach((): void => {
			securityModel.flush = sinon.stub();
			$httpBackend.whenPOST(/securities$/, security).respond(200);
			$httpBackend.whenPATCH(/securities\/1$/, security).respond(200);
		});

		it("should flush the security cache", (): void => {
			$httpBackend.expectPATCH(/securities\/1$/);
			securityModel.save(security);
			securityModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /securities when an id is not provided", (): void => {
			delete security.id;
			$httpBackend.expectPOST(/securities$/);
			securityModel.save(security);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /securities/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(/securities\/1$/);
			securityModel.save(security);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		beforeEach((): void => {
			securityModel.flush = sinon.stub();
			securityModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/securities\/1$/).respond(200);
			securityModel.destroy(security);
			$httpBackend.flush();
		});

		it("should flush the security cache", (): Chai.Assertion => securityModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /securities/{id}", (): null => null);

		it("should remove the securty from the recent list", (): Chai.Assertion => securityModel.removeRecent.should.have.been.calledWith(1));
	});

	describe("toggleFavourite", (): void => {
		beforeEach((): void => {
			securityModel.flush = sinon.stub();
			$httpBackend.whenDELETE(/securities\/1\/favourite$/).respond(200);
			$httpBackend.whenPUT(/securities\/1\/favourite$/).respond(200);
		});

		it("should flush the security cache", (): void => {
			securityModel.toggleFavourite(security);
			securityModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /securities/{id}/favourite when the security is unfavourited", (): void => {
			$httpBackend.expectDELETE(/securities\/1\/favourite$/);
			security.favourite = true;
			securityModel.toggleFavourite(security).should.eventually.equal(false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /securities/{id}/favourite when the security is favourited", (): void => {
			$httpBackend.expectPUT(/securities\/1\/favourite$/);
			securityModel.toggleFavourite(security).should.eventually.equal(true);
			$httpBackend.flush();
		});
	});

	describe("flush", (): void => {
		it("should remove the specified security from the security cache when an id is provided", (): void => {
			securityModel.flush(1);
			$cache.remove.should.have.been.calledWith("/securities/1");
		});

		it("should flush the security cache when an id is not provided", (): void => {
			securityModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => securityModel.addRecent(security));

		it("should add the security to the recent list", (): void => {
			ogLruCache.put.should.have.been.calledWith(security);
			securityModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentSecurities", JSON.stringify([{id: 1, name: "recent item"}])));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => securityModel.removeRecent(1));

		it("should remove the security from the recent list", (): void => {
			ogLruCache.remove.should.have.been.calledWith(1);
			securityModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentSecurities", JSON.stringify([{id: 1, name: "recent item"}])));
	});
});
