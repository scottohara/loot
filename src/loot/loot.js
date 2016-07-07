{
	/**
	 * Registration
	 */
	const mod = angular.module("lootApp", [
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

	// Default to account list for any unmatched URLs
	mod.config(["$urlRouterProvider", "lootStatesProvider", $urlRouterProvider => $urlRouterProvider.otherwise("/accounts")]);

	// Runtime initialisation
	mod.run(["$rootScope", "$state", "ogNavigatorServiceWorkerService",
		($rootScope, $state, ogNavigatorServiceWorkerService) => {
			$rootScope.$state = $state;

			// Listen for state change error events, and log them to the console
			$rootScope.stateChangeErrorHandler = (event, toState, toParams, fromState, fromParams, error) => console.error(toState, toParams, fromState, fromParams, error);

			// Handler is wrapped in a function to aid with unit testing
			$rootScope.$on("$stateChangeError", (event, toState, toParams, fromState, fromParams, error) => $rootScope.stateChangeErrorHandler(event, toState, toParams, fromState, fromParams, error));

			// ServiceWorker registration
			ogNavigatorServiceWorkerService.register("/service-worker.js");
		}
	]);
}
