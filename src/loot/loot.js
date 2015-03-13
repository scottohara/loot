(function () {
	"use strict";

	/**
	 * Registration
	 */
	var mod = angular.module("lootApp", [
		"ui.bootstrap",
		"ui.router",
		"ogComponents",
		"lootAccounts",
		"lootAuthentication",
		"lootCategories",
		"lootPayees",
		"lootSchedules",
		"lootSecurities",
		"lootStates",
		"lootTransactions"
	]);

	// Define the States and URL routing
	mod.config(["$httpProvider", "$urlRouterProvider", "lootStatesProvider",
		function($httpProvider, $urlRouterProvider) {
			// All HTTP requests will be JSON
			$httpProvider.defaults.headers.common.Accept = "application/json";

			// Default to account list for any unmatched URLs
			$urlRouterProvider.otherwise("/accounts");
		}
	]);

	// Runtime initialisation
	mod.run(["$rootScope", "$state",
		function($rootScope, $state) {
			$rootScope.$state = $state;

			//TODO - debugging
			// Listen for state change error events, and log them to the console
			$rootScope.stateChangeErrorHandler = function(event, toState, toParams, fromState, fromParams, error) {
				console.log(toState, toParams, fromState, fromParams, error);
			};

			// Handler is wrapped in a function to aid with unit testing
			$rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
				$rootScope.stateChangeErrorHandler(event, toState, toParams, fromState, fromParams, error);
			});
		}
	]);
})();
