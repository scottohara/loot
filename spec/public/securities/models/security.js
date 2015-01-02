(function() {
	"use strict";

	/*jshint expr: true */

	describe("securityModel", function() {
		// The object under test
		var securityModel;

		// Dependencies
		var $httpBackend,
				$http,
				$cacheFactory,
				$cache,
				$window,
				ogLruCacheFactory,
				ogLruCache;

		// Load the modules
		beforeEach(module("lootMocks", "securities", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"]);
		}));

		// Inject any dependencies that need to be configured first
		beforeEach(inject(function(_$window_) {
			$window = _$window_;
			$window.localStorage.getItem.withArgs("lootRecentSecurities").returns(null);
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_securityModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) {
			securityModel = _securityModel_;

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

		it ("should fetch the list of recent securities from localStorage", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootRecentSecurities");
		});

		it("should have a list of recent securiteis", function() {
			ogLruCache.list.should.have.been.called;
			securityModel.recent.should.equal("recent list");
		});

		describe("type", function() {
			it("should be 'security'", function() {
				securityModel.type().should.equal("security");
			});
		});

		describe("path", function() {
			it("should return the securities collection path when an id is not provided", function() {
				securityModel.path().should.equal("/securities");
			});

			it("should return a specific security path when an id is provided", function() {
				securityModel.path(123).should.equal("/securities/123");
			});
		});

		describe("all", function() {
			var expectedUrl = /securities$/,
					expectedResponse = "securities without balances";

			it("should dispatch a GET request to /securities", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				securityModel.all();
				$httpBackend.flush();
			});
			
			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				securityModel.all();
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should return a list of all securities without their balances", function() {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				securityModel.all().should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});

			describe("(include balances)", function() {
				beforeEach(function() {
					expectedUrl = /securities\?include_balances/;
					expectedResponse = "categories with children";
				});

				it("should dispatch a GET request to /securities?include_balances", function() {
					$httpBackend.expect("GET", expectedUrl).respond(200);
					securityModel.all(true);
					$httpBackend.flush();
				});
				
				it("should not cache the response in the $http cache", function() {
					var httpGet = sinon.stub($http, "get").returns({
						then: function() {}
					});

					securityModel.all(true);
					httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
				});

				it("should return a list of all securities including their balances", function() {
					$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
					securityModel.all(true).should.eventually.equal(expectedResponse);
					$httpBackend.flush();
				});
			});
		});

		describe("allWithBalances", function() {
			var expected = "securities with balances";

			beforeEach(function() {
				securityModel.all = sinon.stub().returns(expected);
			});

			it("should call securityModel.all(true)", function() {
				securityModel.allWithBalances();
				securityModel.all.should.have.been.calledWith(true);
			});

			it("should return a list of all securities including their balances", function() {
				securityModel.allWithBalances().should.equal(expected);
			});
		});

		describe("findLastTransaction", function() {
			var expectedResponse = "last transaction",
					actualResponse;

			beforeEach(function() {
				$httpBackend.expectGET(/securities\/123\/transactions\/last\?account_type=accountType$/).respond(200, expectedResponse);
				actualResponse = securityModel.findLastTransaction(123, "accountType");
				$httpBackend.flush();
			});

			it("should dispatch a GET request to /securities/{id}/transactions/last?account_type={accountType}", function() {
			});

			it("should return the last transaction for the security", function() {
				actualResponse.should.eventually.equal(expectedResponse);
			});
		});

		describe("find", function() {
			var expectedUrl = /securities\/123/,
					expectedResponse = "security details";

			beforeEach(function() {
				securityModel.addRecent = sinon.stub();
			});

			it("should dispatch a GET request to /securities/{id}", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				securityModel.find(123);
				$httpBackend.flush();
			});

			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				securityModel.find(123);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should add the security to the recent list", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				securityModel.find(123);
				$httpBackend.flush();
				securityModel.addRecent.should.have.been.calledWith(expectedResponse);
			});

			it("should return the security", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				securityModel.find(123).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});

		describe("save", function() {
			beforeEach(function() {
				securityModel.flush = sinon.stub();
				$httpBackend.whenPOST(/securities$/, {}).respond(200);
				$httpBackend.whenPATCH(/securities\/123$/, {id: 123}).respond(200);
			});

			it("should flush the security cache", function() {
				securityModel.save({});
				securityModel.flush.should.have.been.called;
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /securities when an id is not provided", function() {
				$httpBackend.expectPOST(/securities$/);
				securityModel.save({});
				$httpBackend.flush();
			});

			it("should dispatch a PATCH request to /securities/{id} when an id is provided", function() {
				$httpBackend.expectPATCH(/securities\/123$/);
				securityModel.save({id: 123});
				$httpBackend.flush();
			});
		});

		describe("destroy", function() {
			beforeEach(function() {
				securityModel.flush = sinon.stub();
				$httpBackend.expectDELETE(/securities\/123$/).respond(200);
				securityModel.destroy({id: 123});
				$httpBackend.flush();
			});

			it("should flush the security cache", function() {
				securityModel.flush.should.have.been.called;
			});

			it("should dispatch a DELETE request to /securities/{id}", function() {
			});
		});

		describe("flush", function() {
			it("should remove the specified security from the security cache when an id is provided", function() {
				securityModel.flush(1);
				$cache.remove.should.have.been.calledWith("/securities/1");
			});

			it("should flush the security cache when an id is not provided", function() {
				securityModel.flush();
				$cache.removeAll.should.have.been.called;
			});
		});

		describe("addRecent", function() {
			beforeEach(function() {
				securityModel.addRecent("security");
			});

			it("should add the security to the recent list", function() {
				ogLruCache.put.should.have.been.calledWith("security");
				securityModel.recent.should.equal("updated list");
			});

			it("should save the updated recent list", function() {
				$window.localStorage.setItem.should.have.been.calledWith("lootRecentSecurities", "{}");
			});
		});
	});
})();
