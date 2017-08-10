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
	mod.config(["$urlServiceProvider", "lootStatesProvider", $urlServiceProvider => $urlServiceProvider.rules.otherwise("/accounts")]);

	// Runtime initialisation
	mod.run(["$rootScope", "$state", "ogNavigatorServiceWorkerService",
		($rootScope, $state, ogNavigatorServiceWorkerService) => {
			$rootScope.$state = $state;

			// ServiceWorker registration
			ogNavigatorServiceWorkerService.register("/service-worker.js");
		}
	]);
}
