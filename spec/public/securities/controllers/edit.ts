import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { Security } from "securities/types";
import SecurityEditController from "securities/controllers/edit";
import { SecurityModelMock } from "mocks/securities/types";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("SecurityEditController", (): void => {
	let	securityEditController: SecurityEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			securityModel: SecurityModelMock,
			security: Security;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "securityModel", "security"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _securityModel_: SecurityModelMock, _security_: Security): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		securityModel = _securityModel_;
		security = _security_;
		securityEditController = controllerTest("SecurityEditController") as SecurityEditController;
	}));

	describe("when a security is provided", (): void => {
		it("should make the passed security available to the view", (): Chai.Assertion => securityEditController.security.should.deep.equal(security));

		it("should set the mode to Edit", (): Chai.Assertion => securityEditController.mode.should.equal("Edit"));
	});

	describe("when a security is not provided", (): void => {
		beforeEach((): SecurityEditController => (securityEditController = controllerTest("SecurityEditController", { security: null }) as SecurityEditController));

		it("should make an empty security object available to the view", (): void => {
			securityEditController.security.should.be.an("object");
			securityEditController.security.should.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion => securityEditController.mode.should.equal("Add"));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			securityEditController.errorMessage = "error message";
			securityEditController.save();
			(null === securityEditController.errorMessage).should.be.true;
		});

		it("should save the security", (): void => {
			securityEditController.save();
			securityModel.save.should.have.been.calledWith(security);
		});

		it("should close the modal when the security save is successful", (): void => {
			securityEditController.save();
			$uibModalInstance.close.should.have.been.calledWith(security);
		});

		it("should display an error message when the security save is unsuccessful", (): void => {
			securityEditController.security.id = -1;
			securityEditController.save();
			(securityEditController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			securityEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
