import type AuthenticationEditController from "~/authentication/controllers/edit";
import type { AuthenticationModelMock } from "~/mocks/authentication/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("AuthenticationEditController", (): void => {
	let	authenticationEditController: AuthenticationEditController,
			$uibModalInstance: UibModalInstanceMock,
			authenticationModel: AuthenticationModelMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAuthentication", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "authenticationModel"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _authenticationModel_: AuthenticationModelMock): void => {
		$uibModalInstance = _$uibModalInstance_;
		authenticationModel = _authenticationModel_;
		authenticationEditController = controllerTest("AuthenticationEditController") as AuthenticationEditController;
	}) as Mocha.HookFunction);

	it("should set null authentication credentials to the view", (): void => {
		expect(authenticationEditController.userName).to.be.null;
		expect(authenticationEditController.password).to.be.null;
	});

	describe("login", (): void => {
		beforeEach((): void => {
			authenticationEditController.userName = "gooduser";
			authenticationEditController.password = "goodpassword";
		});

		it("should reset any previous error messages", (): void => {
			authenticationEditController.errorMessage = "error message";
			authenticationEditController.login();
			expect(authenticationEditController.errorMessage as string | null).to.be.null;
		});

		it("should attempt to login with the username & password", (): void => {
			authenticationEditController.login();
			expect(authenticationModel.login).to.have.been.calledWith("gooduser", "goodpassword");
		});

		it("should close the modal when login successful", (): void => {
			authenticationEditController.login();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when login unsuccessful", (): void => {
			authenticationEditController.userName = "baduser";
			authenticationEditController.password = "badpassword";
			authenticationEditController.login();
			expect(authenticationEditController.errorMessage as string).to.equal("unsuccessful");
			expect(authenticationEditController.loginInProgress).to.be.false;
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			authenticationEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
