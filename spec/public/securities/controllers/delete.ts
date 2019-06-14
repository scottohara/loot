import {ControllerTestFactory} from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {Security} from "securities/types";
import SecurityDeleteController from "securities/controllers/delete";
import {SecurityModelMock} from "mocks/securities/types";
import {UibModalInstanceMock} from "mocks/node-modules/angular/types";
import angular from "angular";

describe("SecurityDeleteController", (): void => {
	let	securityDeleteController: SecurityDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			securityModel: SecurityModelMock,
			security: Security;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "securityModel", "security"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _securityModel_: SecurityModelMock, _security_: Security): void => {
		$uibModalInstance = _$uibModalInstance_;
		securityModel = _securityModel_;
		security = _security_;
		securityDeleteController = controllerTest("SecurityDeleteController") as SecurityDeleteController;
	}));

	it("should make the passed security available to the view", (): Chai.Assertion => securityDeleteController.security.should.deep.equal(security));

	describe("deleteSecurity", (): void => {
		it("should reset any previous error messages", (): void => {
			securityDeleteController.errorMessage = "error message";
			securityDeleteController.deleteSecurity();
			(null === securityDeleteController.errorMessage).should.be.true;
		});

		it("should delete the security", (): void => {
			securityDeleteController.deleteSecurity();
			securityModel.destroy.should.have.been.calledWith(security);
		});

		it("should close the modal when the security delete is successful", (): void => {
			securityDeleteController.deleteSecurity();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the security delete is unsuccessful", (): void => {
			securityDeleteController.security.id = -1;
			securityDeleteController.deleteSecurity();
			(securityDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			securityDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
