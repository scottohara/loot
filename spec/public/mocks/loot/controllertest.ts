import {
	ControllerTestFactory,
	ControllerTestLocals
} from "mocks/types";

export default class ControllerTest {
	public constructor($rootScope: angular.IRootScopeService, $controller: angular.IControllerService) {
		// Loads the controller and returns a scope object
		return ((controller: string, locals: ControllerTestLocals = {}, bindings: {} = {}): angular.IController => {
			// Create a new scope
			locals.$scope = $rootScope.$new();

			// Load the controller
			const instance: angular.IController = $controller(controller, locals, bindings);

			// Attach the scope to the returned instance as $scope
			instance.$scope = locals.$scope;

			return instance;
		}) as ControllerTestFactory;
	}
}

ControllerTest.$inject = ["$rootScope", "$controller"];