(function() {
	"use strict";

	/*jshint expr: true */

	describe("authenticationModel", function() {
		// The object under test
		var authenticationModel;

		// Dependencies
		var $httpBackend,
				$http,
				$cacheFactory,
				$cache,
				$window;

		// Load the modules
		beforeEach(module("lootMocks", "authentication"));

		// Mock the dependencies
		beforeEach(module(function($provide, $injector) {
			$cacheFactory = $injector.get("$cacheFactoryMockProvider").$get();
			$cache = $cacheFactory();

			$window = $injector.get("$windowMockProvider").$get();

			$provide.value("$cacheFactory", $cacheFactory);
			$provide.value("$window", $window);
		}));

		// Inject the object under test and the $httpBackend
		beforeEach(inject(function(_authenticationModel_, _$httpBackend_, _$http_) {
			authenticationModel = _authenticationModel_;
			$httpBackend = _$httpBackend_;
			$http = _$http_;
		}));

		describe("isAuthenticated", function() {
			it("should fetch the authentication key from sessionStorage", function() {
				authenticationModel.isAuthenticated();
				$window.sessionStorage.getItem.should.have.been.calledWith("lootAuthenticationKey");
			});

			describe("when authenticated", function() {
				var isAuthenticated;

				beforeEach(function() {
					$window.sessionStorage.getItem.returns("authentication key");
					isAuthenticated = authenticationModel.isAuthenticated();
				});

				it("should set the default $http Authorization header", function() {
					$http.defaults.headers.common.Authorization.should.equal("Basic authentication key");
				});

				it("should be true", function() {
					isAuthenticated.should.be.true;
				});
			});

			describe("when not authenticated", function() {
				it("should be false", function() {
					authenticationModel.isAuthenticated().should.be.false;
				});
			});
		});

		describe("login", function() {
			beforeEach(function() {
				$httpBackend.expectPOST(/logins/, null, {Authorization: "Basic base64 encoded"}).respond(200, "authentication key");
				authenticationModel.login("username", "password");
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /logins, containing an Authorization header", function() {
				// TODO - check auth key
			});

			it("should save the authentication key to sessionStorage", function() {
				$window.sessionStorage.setItem.should.have.been.calledWith("lootAuthenticationKey", "base64 encoded");
			});

			it("should set the default $http Authorization header", function() {
				$http.defaults.headers.common.Authorization.should.equal("Basic base64 encoded");
			});
		});

		describe("logout", function() {
			/*var expectedUrl = /accounts$/,
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
			});*/
		});
	});
})();
