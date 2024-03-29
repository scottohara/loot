import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Transaction } from "~/transactions/types";
import type TransactionDeleteController from "~/transactions/controllers/delete";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("TransactionDeleteController", (): void => {
	let transactionDeleteController: TransactionDeleteController,
		$uibModalInstance: UibModalInstanceMock,
		transactionModel: TransactionModelMock,
		transaction: Transaction;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"transactionModel",
					"transaction",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				controllerTest: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_transactionModel_: TransactionModelMock,
				_transaction_: Transaction,
			): void => {
				$uibModalInstance = _$uibModalInstance_;
				transactionModel = _transactionModel_;
				transaction = _transaction_;
				transactionDeleteController = controllerTest(
					"TransactionDeleteController",
				) as TransactionDeleteController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed transaction available to the view", (): Chai.Assertion =>
		expect(transactionDeleteController["transaction"]).to.deep.equal(
			transaction,
		));

	describe("deleteTransaction", (): void => {
		it("should reset any previous error messages", (): void => {
			transactionDeleteController.errorMessage = "error message";
			transactionDeleteController.deleteTransaction();
			expect(transactionDeleteController.errorMessage as string | null).to.be
				.null;
		});

		it("should delete the transaction", (): void => {
			transactionDeleteController.deleteTransaction();
			expect(transactionModel.destroy).to.have.been.calledWith(transaction);
		});

		it("should close the modal when the transaction delete is successful", (): void => {
			transactionDeleteController.deleteTransaction();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when the transaction delete is unsuccessful", (): void => {
			transactionDeleteController["transaction"].id = -1;
			transactionDeleteController.deleteTransaction();
			expect(transactionDeleteController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			transactionDeleteController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
