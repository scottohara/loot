import angular from "angular";

describe("TransactionDeleteController", () => {
	let	transactionDeleteController,
			$uibModalInstance,
			transactionModel,
			transaction;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "transactionModel", "transaction"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$uibModalInstance_, _transactionModel_, _transaction_) => {
		$uibModalInstance = _$uibModalInstance_;
		transactionModel = _transactionModel_;
		transaction = _transaction_;
		transactionDeleteController = controllerTest("TransactionDeleteController");
	}));

	it("should make the passed transaction available to the view", () => transactionDeleteController.transaction.should.deep.equal(transaction));

	describe("deleteTransaction", () => {
		it("should reset any previous error messages", () => {
			transactionDeleteController.errorMessage = "error message";
			transactionDeleteController.deleteTransaction();
			(null === transactionDeleteController.errorMessage).should.be.true;
		});

		it("should delete the transaction", () => {
			transactionDeleteController.deleteTransaction();
			transactionModel.destroy.should.have.been.calledWith(transaction);
		});

		it("should close the modal when the transaction delete is successful", () => {
			transactionDeleteController.deleteTransaction();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the transaction delete is unsuccessful", () => {
			transactionDeleteController.transaction.id = -1;
			transactionDeleteController.deleteTransaction();
			transactionDeleteController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			transactionDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
