(function() {
	"use strict";

	/*jshint expr: true */

	describe("payeeModel", function() {
		// The object under test
		var payeeModel;

		// Dependencies
		var $httpBackend,
				$http,
				$cacheFactory,
				$cache,
				$window,
				ogLruCacheFactory,
				ogLruCache;

		// Load the modules
		beforeEach(module("lootMocks", "payees", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"]);
		}));

		// Inject any dependencies that need to be configured first
		beforeEach(inject(function(_$window_) {
			$window = _$window_;
			$window.localStorage.getItem.withArgs("lootRecentPayees").returns(null);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_payeeModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) {
			payeeModel = _payeeModel_;

			$httpBackend = _$httpBackend_;
			$http = _$http_;

			$cacheFactory = _$cacheFactory_;
			$cache = $cacheFactory();

			ogLruCacheFactory = _ogLruCacheFactory_;
			ogLruCache = ogLruCacheFactory();
		}));

		// After each spec, verify that there are no outstanding http expectations or requests
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it ("should fetch the list of recent payees from localStorage", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootRecentPayees");
		});

		it("should have a list of recent payees", function() {
			ogLruCache.list.should.have.been.called;
			payeeModel.recent.should.equal("recent list");
		});

		describe("type", function() {
			it("should be 'payee'", function() {
				payeeModel.type().should.equal("payee");
			});
		});

		describe("path", function() {
			it("should return the payees collection path when an id is not provided", function() {
				payeeModel.path().should.equal("/payees");
			});

			it("should return a specific payee path when an id is provided", function() {
				payeeModel.path(123).should.equal("/payees/123");
			});
		});

		describe("all", function() {
			var expectedUrl = /payees$/,
					expectedResponse = "payees";

			it("should dispatch a GET request to /payees", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				payeeModel.all();
				$httpBackend.flush();
			});
			
			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				payeeModel.all();
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should return a list of all payees", function() {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				payeeModel.all().should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});

		describe("findLastTransaction", function() {
			var expectedResponse = "last transaction",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/payees\/123\/transactions\/last\?account_type=accountType$/).respond(200, expectedResponse);
				actualResponse = payeeModel.findLastTransaction(123, "accountType");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /payees/{id}/transactions/last?account_type={accountType}", function() {
			});

			it("should return the last transaction for the payee", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("find", function() {
			var expectedUrl = /payees\/123/,
					expectedResponse = "payee details";

			beforeEach(function() {
				payeeModel.addRecent = sinon.stub();
			});

			it("should dispatch a GET request to /payees/{id}", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				payeeModel.find(123);
				$httpBackend.flush();
			});

			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				payeeModel.find(123);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should add the payee to the recent list", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				payeeModel.find(123);
				$httpBackend.flush();
				payeeModel.addRecent.should.have.been.calledWith(expectedResponse);
			});

			it("should return the payee", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				payeeModel.find(123).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});

		describe("save", function() {
			beforeEach(function() {
				payeeModel.flush = sinon.stub();
				$httpBackend.whenPOST(/payees$/, {}).respond(200);
				$httpBackend.whenPATCH(/payees\/123$/, {id: 123}).respond(200);
			});

			it("should flush the payee cache", function() {
				payeeModel.save({});
				payeeModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /payees when an id is not provided", function() {
				$httpBackend.expectPOST(/payees$/);
				payeeModel.save({});
				$httpBackend.flush();
			});

			it("should dispatch a PATCH request to /payees/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/payees\/123$/);
				payeeModel.save({id: 123});
				$httpBackend.flush();
			});
		});

		describe("destroy", function() {
			beforeEach(function() {
				payeeModel.flush = sinon.stub();
				$httpBackend.expectDELETE(/payees\/123$/).respond(200);
				payeeModel.destroy({id: 123});
				$httpBackend.flush();
			});

			it("should flush the payee cache", function() {
				payeeModel.flush.should.have.been.called;
			});

			it("should dispatch a DELETE request to /payees/{id}", function() {
			});
		});

		describe("flush", function() {
			it("should remove the specified payee from the payee cache when an id is provided", function() {
				payeeModel.flush(1);
				$cache.remove.should.have.been.calledWith("/payees/1");
			});

			it("should flush the payee cache when an id is not provided", function() {
				payeeModel.flush();
				$cache.removeAll.should.have.been.called;
			});
		});

		describe("addRecent", function() {
			beforeEach(function() {
				payeeModel.addRecent("payee");
			});

			it("should add the payee to the recent list", function() {
				ogLruCache.put.should.have.been.calledWith("payee");
				payeeModel.recent.should.equal("updated list");
			});

			it("should save the updated recent list", function() {
				$window.localStorage.setItem.should.have.been.calledWith("lootRecentPayees", "{}");
			});
		});
	});
})();
