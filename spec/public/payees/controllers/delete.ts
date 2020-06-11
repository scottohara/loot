import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { Payee } from "payees/types";
import PayeeDeleteController from "payees/controllers/delete";
import { PayeeModelMock } from "mocks/payees/types";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("PayeeDeleteController", (): void => {
	let	payeeDeleteController: PayeeDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			payeeModel: PayeeModelMock,
			payee: Payee;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootPayees", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "payee"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _payeeModel_: PayeeModelMock, _payee_: Payee): void => {
		$uibModalInstance = _$uibModalInstance_;
		payeeModel = _payeeModel_;
		payee = _payee_;
		payeeDeleteController = controllerTest("PayeeDeleteController") as PayeeDeleteController;
	}));

	it("should make the passed payee available to the view", (): Chai.Assertion => payeeDeleteController.payee.should.deep.equal(payee));

	describe("deletePayee", (): void => {
		it("should reset any previous error messages", (): void => {
			payeeDeleteController.errorMessage = "error message";
			payeeDeleteController.deletePayee();
			(null === payeeDeleteController.errorMessage as string | null).should.be.true;
		});

		it("should delete the payee", (): void => {
			payeeDeleteController.deletePayee();
			payeeModel.destroy.should.have.been.calledWith(payee);
		});

		it("should close the modal when the payee delete is successful", (): void => {
			payeeDeleteController.deletePayee();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the payee delete is unsuccessful", (): void => {
			payeeDeleteController.payee.id = -1;
			payeeDeleteController.deletePayee();
			(payeeDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			payeeDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
