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
		beforeEach(module("lootMocks", "lootAuthentication", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$cacheFactory", "$window"]);
		}));

		// Inject the object under test and the $httpBackend
		beforeEach(inject(function(_authenticationModel_, _$httpBackend_, _$http_, _$cacheFactory_, _$window_) {
			authenticationModel = _authenticationModel_;

			$httpBackend = _$httpBackend_;
			$http = _$http_;

			$cacheFactory = _$cacheFactory_;
			$cache = $cacheFactory();

			$window = _$window_;
		}));

		// After each spec, verify that there are no outstanding http expectations or requests
		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

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
				$httpBackend.expectPOST(/logins/, undefined, function(headers) { return headers.Authorization === "Basic base64 encoded"; }).respond(200, "authentication key");
				authenticationModel.login("username", "password");
				$httpBackend.flush();
			});

			it("should dispatch a POST request to /logins, containing an Authorization header", function() {
			});

			it("should save the authentication key to sessionStorage", function() {
				$window.sessionStorage.setItem.should.have.been.calledWith("lootAuthenticationKey", "base64 encoded");
			});

			it("should set the default $http Authorization header", function() {
				$http.defaults.headers.common.Authorization.should.equal("Basic base64 encoded");
			});

		});

		describe("logout", function() {
			beforeEach(function() {
				authenticationModel.logout();
			});

			it("should remove the authentication key from sessionStorage", function() {
				$window.sessionStorage.removeItem.should.have.been.calledWith("lootAuthenticationKey");
			});

			it("should clear the default $http Authorization header", function() {
				$http.defaults.headers.common.Authorization.should.equal("Basic ");
			});

			it("should clear all $http caches except the template cache", function() {
				$cache.removeAll.should.have.been.called;
				$cacheFactory.get("templates").removeAll.should.not.have.been.called;
			});
		});
	});
})();
