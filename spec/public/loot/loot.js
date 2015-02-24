(function() {
	"use strict";

	/*jshint expr: true */

	describe("loot", function() {
		// Dependencies
		var	$urlRouterProvider,
				$http,
				$rootScope,
				$state;

		// Load the modules
		beforeEach(module("ui.router", function(_$urlRouterProvider_) {
			$urlRouterProvider = _$urlRouterProvider_;
			sinon.stub($urlRouterProvider, "otherwise");
		}));

		beforeEach(module("lootMocks", "lootApp", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$state"]);
		}));

		// Inject any dependencies that need to be configured first
		beforeEach(inject(function(_$http_, _$rootScope_, _$state_) {
			$http = _$http_;
			$rootScope = _$rootScope_;
			$state = _$state_;
		}));

		describe("config", function() {
			it("should default all HTTP calls to JSON", function() {
				$http.defaults.headers.common.Accept.should.equal("application/json");
			});

			it("should set a default URL route", function() {
				$urlRouterProvider.otherwise.should.have.been.calledWith("/accounts");
			});
		});

		describe("run", function() {
			it("should make the state configuration available on the $rootScope", function() {
				$rootScope.$state.should.deep.equal($state);
			});

			describe("stateChangeErrorHandler", function() {
				it("should log the error to the browser console", function() {
					var toState = "to state",
							toParams = "to params",
							fromState = "from state",
							fromParams = "from params",
							error = "error";

					sinon.stub(console, "log");

					$rootScope.stateChangeErrorHandler(undefined, toState, toParams, fromState, fromParams, error);
					console.log.should.have.been.calledWith(toState, toParams, fromState, fromParams);
				});
			});

			it("should attach a state change error handler", function() {
				sinon.stub($rootScope, "stateChangeErrorHandler");
				$rootScope.$emit("$stateChangeError");
				$rootScope.stateChangeErrorHandler.should.have.been.called;
			});
		});
	});
})();
