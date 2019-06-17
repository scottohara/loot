import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { Transaction } from "transactions/types";
import TransactionDeleteController from "transactions/controllers/delete";
import { TransactionModelMock } from "mocks/transactions/types";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("TransactionDeleteController", (): void => {
	let	transactionDeleteController: TransactionDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			transactionModel: TransactionModelMock,
			transaction: Transaction;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "transactionModel", "transaction"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _transactionModel_: TransactionModelMock, _transaction_: Transaction): void => {
		$uibModalInstance = _$uibModalInstance_;
		transactionModel = _transactionModel_;
		transaction = _transaction_;
		transactionDeleteController = controllerTest("TransactionDeleteController") as TransactionDeleteController;
	}));

	it("should make the passed transaction available to the view", (): Chai.Assertion => transactionDeleteController["transaction"].should.deep.equal(transaction));

	describe("deleteTransaction", (): void => {
		it("should reset any previous error messages", (): void => {
			transactionDeleteController.errorMessage = "error message";
			transactionDeleteController.deleteTransaction();
			(null === transactionDeleteController.errorMessage).should.be.true;
		});

		it("should delete the transaction", (): void => {
			transactionDeleteController.deleteTransaction();
			transactionModel.destroy.should.have.been.calledWith(transaction);
		});

		it("should close the modal when the transaction delete is successful", (): void => {
			transactionDeleteController.deleteTransaction();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the transaction delete is unsuccessful", (): void => {
			transactionDeleteController["transaction"].id = -1;
			transactionDeleteController.deleteTransaction();
			(transactionDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			transactionDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
