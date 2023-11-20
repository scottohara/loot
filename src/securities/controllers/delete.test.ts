import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Security } from "~/securities/types";
import type SecurityDeleteController from "~/securities/controllers/delete";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("SecurityDeleteController", (): void => {
	let securityDeleteController: SecurityDeleteController,
		$uibModalInstance: UibModalInstanceMock,
		securityModel: SecurityModelMock,
		security: Security;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootSecurities",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"securityModel",
					"security",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				controllerTest: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_securityModel_: SecurityModelMock,
				_security_: Security,
			): void => {
				$uibModalInstance = _$uibModalInstance_;
				securityModel = _securityModel_;
				security = _security_;
				securityDeleteController = controllerTest(
					"SecurityDeleteController",
				) as SecurityDeleteController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed security available to the view", (): Chai.Assertion =>
		expect(securityDeleteController.security).to.deep.equal(security));

	describe("deleteSecurity", (): void => {
		it("should reset any previous error messages", (): void => {
			securityDeleteController.errorMessage = "error message";
			securityDeleteController.deleteSecurity();
			expect(securityDeleteController.errorMessage as string | null).to.be.null;
		});

		it("should delete the security", (): void => {
			securityDeleteController.deleteSecurity();
			expect(securityModel.destroy).to.have.been.calledWith(security);
		});

		it("should close the modal when the security delete is successful", (): void => {
			securityDeleteController.deleteSecurity();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when the security delete is unsuccessful", (): void => {
			securityDeleteController.security.id = -1;
			securityDeleteController.deleteSecurity();
			expect(securityDeleteController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			securityDeleteController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
