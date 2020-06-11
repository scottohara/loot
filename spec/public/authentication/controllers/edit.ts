import AuthenticationEditController from "authentication/controllers/edit";
import { AuthenticationModelMock } from "mocks/authentication/types";
import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("AuthenticationEditController", (): void => {
	let	authenticationEditController: AuthenticationEditController,
			$uibModalInstance: UibModalInstanceMock,
			authenticationModel: AuthenticationModelMock;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAuthentication", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "authenticationModel"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _authenticationModel_: AuthenticationModelMock): void => {
		$uibModalInstance = _$uibModalInstance_;
		authenticationModel = _authenticationModel_;
		authenticationEditController = controllerTest("AuthenticationEditController") as AuthenticationEditController;
	}));

	it("should set null authentication credentials to the view", (): void => {
		(null === authenticationEditController.userName).should.be.true;
		(null === authenticationEditController.password).should.be.true;
	});

	describe("login", (): void => {
		beforeEach((): void => {
			authenticationEditController.userName = "gooduser";
			authenticationEditController.password = "goodpassword";
		});

		it("should reset any previous error messages", (): void => {
			authenticationEditController.errorMessage = "error message";
			authenticationEditController.login();
			(null === authenticationEditController.errorMessage as string | null).should.be.true;
		});

		it("should attempt to login with the username & password", (): void => {
			authenticationEditController.login();
			authenticationModel.login.should.have.been.calledWith("gooduser", "goodpassword");
		});

		it("should close the modal when login successful", (): void => {
			authenticationEditController.login();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when login unsuccessful", (): void => {
			authenticationEditController.userName = "baduser";
			authenticationEditController.password = "badpassword";
			authenticationEditController.login();
			(authenticationEditController.errorMessage as string).should.equal("unsuccessful");
			authenticationEditController.loginInProgress.should.be.false;
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			authenticationEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
