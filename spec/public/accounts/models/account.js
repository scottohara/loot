(function() {
	"use strict";

	/*jshint expr: true */

	describe("accountModel", function() {
		// The object under test
		var accountModel;

		// Dependencies
		var $httpBackend,
				$http,
				$cacheFactory,
				$cache,
				$window,
				ogLruCacheFactory,
				ogLruCache;

		// Load the modules
		beforeEach(module("lootMocks", "accounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$cacheFactory", "$window", "ogLruCacheFactory"]);
		}));

		// Inject any dependencies that need to be configured first
		beforeEach(inject(function(_$window_) {
			$window = _$window_;
			$window.localStorage.getItem.withArgs("lootRecentAccounts").returns(null);
			$window.localStorage.getItem.withArgs("lootUnreconciledOnly-123").returns("true");
			$window.localStorage.getItem.withArgs("lootUnreconciledOnly-456").returns("false");
		}));

		// Inject the object under test and it's remaining dependencies
		beforeEach(inject(function(_accountModel_, _$httpBackend_, _$http_, _$cacheFactory_, _ogLruCacheFactory_) {
			accountModel = _accountModel_;

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

		it("should fetch the list of recent accounts from localStorage", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootRecentAccounts");
		});

		it("should have a list of recent accounts", function() {
			ogLruCache.list.should.have.been.called;
			accountModel.recent.should.equal("recent list");
		});

		describe("type", function() {
			it("should be 'account'", function() {
				accountModel.type().should.equal("account");
			});
		});

		describe("path", function() {
			it("should return the accounts collection path when an id is not provided", function() {
				accountModel.path().should.equal("/accounts");
			});

			it("should return a specific account path when an id is provided", function() {
				accountModel.path(123).should.equal("/accounts/123");
			});
		});

		describe("all", function() {
			var expectedUrl = /accounts$/,
					expectedResponse = "accounts without balances";

			it("should dispatch a GET request to /accounts", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				accountModel.all();
				$httpBackend.flush();
			});
			
			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				accountModel.all();
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should return a list of all accounts without their balances", function() {
				$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
				accountModel.all().should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});

			describe("(include balances)", function() {
				beforeEach(function() {
					expectedUrl = /accounts\?include_balances/;
					expectedResponse = "accounts with balances";
				});

				it("should dispatch a GET request to /accounts?include_balances", function() {
					$httpBackend.expect("GET", expectedUrl).respond(200);
					accountModel.all(true);
					$httpBackend.flush();
				});
				
				it("should not cache the response in the $http cache", function() {
					var httpGet = sinon.stub($http, "get").returns({
						then: function() {}
					});

					accountModel.all(true);
					httpGet.firstCall.args[1].should.have.a.property("cache").that.is.false;
				});

				it("should return a list of all accounts including their balances", function() {
					$httpBackend.when("GET", expectedUrl).respond(200, expectedResponse);
					accountModel.all(true).should.eventually.equal(expectedResponse);
					$httpBackend.flush();
				});
			});
		});

		describe("allWithBalances", function() {
			var expected = "accounts with balances";

			beforeEach(function() {
				accountModel.all = sinon.stub().returns(expected);
			});

			it("should call accountModel.all(true)", function() {
				accountModel.allWithBalances();
				accountModel.all.should.have.been.calledWith(true);
			});

			it("should return a list of all accounts including their balances", function() {
				accountModel.allWithBalances().should.equal(expected);
			});
		});

		describe("find", function() {
			var expectedUrl = /accounts\/123/,
					expectedResponse = "account details";

			beforeEach(function() {
				accountModel.addRecent = sinon.stub();
			});

			it("should dispatch a GET request to /accounts/{id}", function() {
				$httpBackend.expect("GET", expectedUrl).respond(200);
				accountModel.find(123);
				$httpBackend.flush();
			});

			it("should cache the response in the $http cache", function() {
				var httpGet = sinon.stub($http, "get").returns({
					then: function() {}
				});

				accountModel.find(123);
				httpGet.firstCall.args[1].should.have.a.property("cache").that.is.not.false;
			});

			it("should add the account to the recent list", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				accountModel.find(123);
				$httpBackend.flush();
				accountModel.addRecent.should.have.been.calledWith(expectedResponse);
			});

			it("should return the account", function() {
				$httpBackend.when("GET", expectedUrl).respond(expectedResponse);
				accountModel.find(123).should.eventually.equal(expectedResponse);
				$httpBackend.flush();
			});
		});

		describe("reconcile", function() {
			var expectedUrl = /accounts\/123\/reconcile/;

			it("should dispatch a PUT request to /account/{id}/reconcile", function() {
				$httpBackend.expect("PUT", expectedUrl).respond(200);
				accountModel.reconcile(123);
				$httpBackend.flush();
			});
		});

		describe("isUnreconciledOnly", function() {
			it("should be true if the account is configured to show unreconciled transactions only", function() {
				accountModel.isUnreconciledOnly(123).should.be.true;
			});

			it("should be false if the account is not configured to show unreconciled transactions only", function() {
				accountModel.isUnreconciledOnly(456).should.be.false;
			});
		});

		describe("unreconciledOnly", function() {
			it("should save the unreconciledOnly setting for the specified account", function() {
				accountModel.unreconciledOnly(123, true);
				$window.localStorage.setItem.should.have.been.calledWith("lootUnreconciledOnly-123", true);
			});
		});

		describe("flush", function() {
			it("should remove the specified account from the account cache when an id is provided", function() {
				accountModel.flush(1);
				$cache.remove.should.have.been.calledWith("/accounts/1");
			});

			it("should flush the account cache when an id is not provided", function() {
				accountModel.flush();
				$cache.removeAll.should.have.been.called;
			});
		});

		describe("addRecent", function() {
			beforeEach(function() {
				accountModel.addRecent("account");
			});

			it("should add the account to the recent list", function() {
				ogLruCache.put.should.have.been.calledWith("account");
				accountModel.recent.should.equal("updated list");
			});

			it("should save the updated recent list", function() {
				$window.localStorage.setItem.should.have.been.calledWith("lootRecentAccounts", "{}");
			});
		});
	});
})();
