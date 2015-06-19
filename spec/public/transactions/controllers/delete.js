describe("TransactionDeleteController", () => {
	let	transactionDeleteController,
			$modalInstance,
			transactionModel,
			transaction;

	// Load the modules
	beforeEach(module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$modalInstance", "transactionModel", "transaction"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$modalInstance_, _transactionModel_, _transaction_) => {
		$modalInstance = _$modalInstance_;
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
			$modalInstance.close.should.have.been.called;
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
			$modalInstance.dismiss.should.have.been.called;
		});
	});
});
