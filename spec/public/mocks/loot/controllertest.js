{
	/**
	 * Implementation
	 */
	class ControllerTest {
		constructor($rootScope, $controller) {
			// Loads the controller and returns a scope object
			return (controller, locals = {}) => {
				// Create a new scope
				locals.$scope = $rootScope.$new();

				// Load the controller
				const instance = $controller(controller, locals);

				// Attach the scope to the returned instance as $scope
				instance.$scope = locals.$scope;

				return instance;
			};
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootMocks")
		.service("controllerTest", ControllerTest);

	/**
	 * Dependencies
	 */
	ControllerTest.$inject = ["$rootScope", "$controller"];
}
