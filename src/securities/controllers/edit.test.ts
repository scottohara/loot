import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Security } from "~/securities/types";
import type SecurityEditController from "~/securities/controllers/edit";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("SecurityEditController", (): void => {
	let	securityEditController: SecurityEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			securityModel: SecurityModelMock,
			security: Security;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "securityModel", "security"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _securityModel_: SecurityModelMock, _security_: Security): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		securityModel = _securityModel_;
		security = _security_;
		securityEditController = controllerTest("SecurityEditController") as SecurityEditController;
	}) as Mocha.HookFunction);

	describe("when a security is provided", (): void => {
		it("should make the passed security available to the view", (): Chai.Assertion => expect(securityEditController.security).to.deep.equal(security));

		it("should set the mode to Edit", (): Chai.Assertion => expect(securityEditController.mode).to.equal("Edit"));
	});

	describe("when a security is not provided", (): void => {
		beforeEach((): SecurityEditController => (securityEditController = controllerTest("SecurityEditController", { security: undefined }) as SecurityEditController));

		it("should make an empty security object available to the view", (): void => {
			expect(securityEditController.security).to.be.an("object");
			expect(securityEditController.security).to.be.empty;
		});

		it("should set the mode to Add", (): Chai.Assertion => expect(securityEditController.mode).to.equal("Add"));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			securityEditController.errorMessage = "error message";
			securityEditController.save();
			expect(securityEditController.errorMessage as string | null).to.be.null;
		});

		it("should save the security", (): void => {
			securityEditController.save();
			expect(securityModel.save).to.have.been.calledWith(security);
		});

		it("should close the modal when the security save is successful", (): void => {
			securityEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(security);
		});

		it("should display an error message when the security save is unsuccessful", (): void => {
			securityEditController.security.id = -1;
			securityEditController.save();
			expect(securityEditController.errorMessage as string).to.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			securityEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
