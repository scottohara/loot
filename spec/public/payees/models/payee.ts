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
import {Payee} from "payees/types";
import PayeeModel from "payees/models/payee";
import angular from "angular";
import {createBasicTransaction} from "mocks/transactions/factories";
import createPayee from "mocks/payees/factories";

describe("payeeModel", (): void => {
	let	payeeModel: PayeeModel,
			$httpBackend: angular.IHttpBackendService,
			$http: angular.IHttpService,
			$cache: angular.ICacheObject,
			$window: WindowMock,
			ogLruCache: OgLruCacheMock,
			payee: Payee;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootPayees", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"])));

	// Inject any dependencies that need to be configured first
	beforeEach(inject((_$window_: WindowMock): void => {
		$window = _$window_;
		$window.localStorage.getItem.withArgs("lootRecentPayees").returns(null);
	}));

	// Inject the object under test and it's remaining dependencies
	beforeEach(inject((_payeeModel_: PayeeModel, _$httpBackend_: angular.IHttpBackendService, _$http_: angular.IHttpService, $cacheFactory: CacheFactoryMock, ogLruCacheFactory: OgLruCacheFactoryMock): void => {
		payeeModel = _payeeModel_;

		$httpBackend = _$httpBackend_;
		$http = _$http_;

		$cache = $cacheFactory();
		ogLruCache = ogLruCacheFactory.new();

		payee = createPayee({id: 1});
	}));

	// After each spec, verify that there are no outstanding http expectations or requests
	afterEach((): void => {
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});

	it("should fetch the list of recent payees from localStorage", (): Chai.Assertion => $window.localStorage.getItem.should.have.been.calledWith("lootRecentPayees"));

	it("should have a list of recent payees", (): Chai.Assertion => payeeModel.recent.should.deep.equal([{id: 1, name: "recent item"}]));

	describe("type", (): void => {
		it("should be 'payee'", (): Chai.Assertion => payeeModel.type.should.equal("payee"));
	});

	describe("path", (): void => {
		it("should return the payees collection path when an id is not provided", (): Chai.Assertion => payeeModel.path().should.equal("/payees"));

		it("should return a specific payee path when an id is provided", (): Chai.Assertion => payeeModel.path(123).should.equal("/payees/123"));
	});

	describe("all", (): void => {
		let expectedUrl: RegExp = /payees$/,
				expectedResponse: string = "payees";

		it("should dispatch a GET request to /payees", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			payeeModel.all();
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			payeeModel.all();
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should return a list of all payees", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
			payeeModel.all().should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});

		describe("(list)", (): void => {
			beforeEach((): void => {
				expectedUrl = /payees\?list/;
				expectedResponse = "payees list";
			});

			it("should dispatch a GET request to /payees?list", (): void => {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				payeeModel.all(true);
				$httpBackend.flush();
			});

			it("should not cache the response in the $http cache", (): void => {
				const httpGet: SinonStub = sinon.stub($http, "get").returns({
					then(): void {
						// Do nothing
					}
				});

				payeeModel.all(true);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
			});

			it("should return a list of all payees for the index list", (): void => {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				payeeModel.all(true).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});
	});

	describe("allList", (): void => {
		const expected: string = "payees list";

		beforeEach((): SinonStub => (payeeModel.all = sinon.stub().returns(expected)));

		it("should call payeeModel.all(true)", (): void => {
			payeeModel.allList();
			payeeModel.all.should.have.been.calledWith(true);
		});

		it("should return a list of all payees for the index list", (): Chai.Assertion => payeeModel.allList().should.equal(expected));
	});

	describe("findLastTransaction", (): void => {
		const expectedResponse: BasicTransaction = createBasicTransaction();
		let actualResponse: angular.IPromise<Transaction>;

		beforeEach((): void => {
			$httpBackend.expectGET(/payees\/1\/transactions\/last\?account_type=bank$/).respond(200, expectedResponse);
			actualResponse = payeeModel.findLastTransaction(1, "bank");
			$httpBackend.flush();
		});

		it("should dispatch a GET request to /payees/{id}/transactions/last?account_type={accountType}", (): null => null);

		it("should return the last transaction for the payee", (): void => {
			actualResponse.should.eventually.deep.equal(expectedResponse);
		});
	});

	describe("find", (): void => {
		const expectedUrl: RegExp = /payees\/123/,
					expectedResponse: string = "payee details";

		beforeEach((): SinonStub => (payeeModel.addRecent = sinon.stub()));

		it("should dispatch a GET request to /payees/{id}", (): void => {
			$httpBackend.expect("GET", expectedUrl).respond(200);
			payeeModel.find(123);
			$httpBackend.flush();
		});

		it("should cache the response in the $http cache", (): void => {
			const httpGet: SinonStub = sinon.stub($http, "get").returns({
				then(): void {
					// Do nothing
				}
			});

			payeeModel.find(123);
			httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
		});

		it("should add the payee to the recent list", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			payeeModel.find(123);
			$httpBackend.flush();
			payeeModel.addRecent.should.have.been.calledWith(expectedResponse);
		});

		it("should return the payee", (): void => {
			$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
			payeeModel.find(123).should.eventually.equal(expectedResponse);
			$httpBackend.flush();
		});
	});

	describe("save", (): void => {
		beforeEach((): void => {
			payeeModel.flush = sinon.stub();
			$httpBackend.whenPOST(/payees$/, payee).respond(200);
			$httpBackend.whenPATCH(/payees\/1$/, payee).respond(200);
		});

		it("should flush the payee cache", (): void => {
			$httpBackend.expectPATCH(/payees\/1$/);
			payeeModel.save(payee);
			payeeModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a POST request to /payees when an id is not provided", (): void => {
			delete payee.id;
			$httpBackend.expectPOST(/payees$/);
			payeeModel.save(payee);
			$httpBackend.flush();
		});

		it("should dispatch a PATCH request to /payees/{id} when an id is provided", (): void => {
			$httpBackend.expectPATCH(/payees\/1$/);
			payeeModel.save(payee);
			$httpBackend.flush();
		});
	});

	describe("destroy", (): void => {
		beforeEach((): void => {
			payeeModel.flush = sinon.stub();
			payeeModel.removeRecent = sinon.stub();
			$httpBackend.expectDELETE(/payees\/1$/).respond(200);
			payeeModel.destroy(payee);
			$httpBackend.flush();
		});

		it("should flush the payee cache", (): Chai.Assertion => payeeModel.flush.should.have.been.called);

		it("should dispatch a DELETE request to /payees/{id}", (): null => null);

		it("should remove the payee from the recent list", (): Chai.Assertion => payeeModel.removeRecent.should.have.been.calledWith(1));
	});

	describe("toggleFavourite", (): void => {
		beforeEach((): void => {
			payeeModel.flush = sinon.stub();
			$httpBackend.whenDELETE(/payees\/1\/favourite$/).respond(200);
			$httpBackend.whenPUT(/payees\/1\/favourite$/).respond(200);
		});

		it("should flush the payee cache", (): void => {
			payeeModel.toggleFavourite(payee);
			payeeModel.flush.should.have.been.called;
			$httpBackend.flush();
		});

		it("should dispatch a DELETE request to /payees/{id}/favourite when the payee is unfavourited", (): void => {
			$httpBackend.expectDELETE(/payees\/1\/favourite$/);
			payee.favourite = true;
			payeeModel.toggleFavourite(payee).should.eventually.equal(false);
			$httpBackend.flush();
		});

		it("should dispatch a PUT request to /payees/{id}/favourite when the payee is favourited", (): void => {
			$httpBackend.expectPUT(/payees\/1\/favourite$/);
			payeeModel.toggleFavourite(payee).should.eventually.equal(true);
			$httpBackend.flush();
		});
	});

	describe("flush", (): void => {
		it("should remove the specified payee from the payee cache when an id is provided", (): void => {
			payeeModel.flush(1);
			$cache.remove.should.have.been.calledWith("/payees/1");
		});

		it("should flush the payee cache when an id is not provided", (): void => {
			payeeModel.flush();
			$cache.removeAll.should.have.been.called;
		});
	});

	describe("addRecent", (): void => {
		beforeEach((): void => payeeModel.addRecent(payee));

		it("should add the payee to the recent list", (): void => {
			ogLruCache.put.should.have.been.calledWith(payee);
			payeeModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentPayees", JSON.stringify([{id: 1, name: "recent item"}])));
	});

	describe("removeRecent", (): void => {
		beforeEach((): void => payeeModel.removeRecent(1));

		it("should remove the payee from the recent list", (): void => {
			ogLruCache.remove.should.have.been.calledWith(1);
			payeeModel.recent.should.equal("updated list");
		});

		it("should save the updated recent list", (): Chai.Assertion => $window.localStorage.setItem.should.have.been.calledWith("lootRecentPayees", JSON.stringify([{id: 1, name: "recent item"}])));
	});
});
