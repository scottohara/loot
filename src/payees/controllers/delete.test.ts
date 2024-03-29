import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Payee } from "~/payees/types";
import type PayeeDeleteController from "~/payees/controllers/delete";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("PayeeDeleteController", (): void => {
	let payeeDeleteController: PayeeDeleteController,
		$uibModalInstance: UibModalInstanceMock,
		payeeModel: PayeeModelMock,
		payee: Payee;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootPayees",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"payeeModel",
					"payee",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				controllerTest: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_payeeModel_: PayeeModelMock,
				_payee_: Payee,
			): void => {
				$uibModalInstance = _$uibModalInstance_;
				payeeModel = _payeeModel_;
				payee = _payee_;
				payeeDeleteController = controllerTest(
					"PayeeDeleteController",
				) as PayeeDeleteController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed payee available to the view", (): Chai.Assertion =>
		expect(payeeDeleteController.payee).to.deep.equal(payee));

	describe("deletePayee", (): void => {
		it("should reset any previous error messages", (): void => {
			payeeDeleteController.errorMessage = "error message";
			payeeDeleteController.deletePayee();
			expect(payeeDeleteController.errorMessage as string | null).to.be.null;
		});

		it("should delete the payee", (): void => {
			payeeDeleteController.deletePayee();
			expect(payeeModel.destroy).to.have.been.calledWith(payee);
		});

		it("should close the modal when the payee delete is successful", (): void => {
			payeeDeleteController.deletePayee();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when the payee delete is unsuccessful", (): void => {
			payeeDeleteController.payee.id = -1;
			payeeDeleteController.deletePayee();
			expect(payeeDeleteController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			payeeDeleteController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
