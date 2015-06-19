{
	/**
	 * Implementation
	 */
	class Factory {
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

		static factory($rootScope, $controller) {
			return new Factory($rootScope, $controller);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootMocks")
		.factory("controllerTest", Factory.factory);

	/**
	 * Dependencies
	 */
	Factory.factory.$inject = ["$rootScope", "$controller"];
}
