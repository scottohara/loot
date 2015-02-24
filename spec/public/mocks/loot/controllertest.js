(function () {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootMocks")
		.factory("controllerTest", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$rootScope", "$controller"];

	/**
	 * Implementation
	 */
	function Factory($rootScope, $controller) {
		// Loads the controller and returns a scope object
		return function(controller, locals) {
			locals = locals || {};

			// Create a new scope
			locals.$scope = $rootScope.$new();

			// Load the controller
			var instance = $controller(controller, locals);

			// Attach the scope to the returned instance as $scope
			instance.$scope = locals.$scope;

			return instance;
		};
	}
})();
