describe("TransactionFlagController", () => {
	let	transactionFlagController,
			controllerTest,
			$uibModalInstance,
			transactionModel,
			transaction;

	// Load the modules
	beforeEach(module("lootMocks", "lootTransactions", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "transactionModel", "transaction"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _transactionModel_, _transaction_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		transactionModel = _transactionModel_;
		transaction = _transaction_;
		transactionFlagController = controllerTest("TransactionFlagController");
	}));

	it("should make the passed transaction available to the view", () => transactionFlagController.transaction.should.deep.equal(transaction));

	it("should make the passed transaction's flag memo available to the view", () => transactionFlagController.flag.should.deep.equal(transaction.flag));

	it("should set the flag to null when transaction's flag memo is '(no memo)'", () => {
		transaction.flag = "(no memo)";
		transactionFlagController = controllerTest("TransactionFlagController");
		(null === transactionFlagController.flag).should.be.true;
	});

	it("should set the flagged property when the transaction has a flag", () => transactionFlagController.flagged.should.be.true);

	it("should clear the flagged property when the transaction doesn't have a flag", () => {
		transaction.flag = null;
		transactionFlagController = controllerTest("TransactionFlagController");
		transactionFlagController.flagged.should.be.false;
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			transactionFlagController.errorMessage = "error message";
			transactionFlagController.save();
			(null === transactionFlagController.errorMessage).should.be.true;
		});

		it("should flag the transaction", () => {
			transactionFlagController.save();
			transactionModel.flag.should.have.been.calledWith(transaction);
		});

		it("should set the flag memo to '(no memo)' if the memo is blank", () => {
			transactionFlagController.flag = null;
			transaction.flag = "(no memo)";
			transactionFlagController.save();
			transactionModel.flag.should.have.been.calledWith(transaction);
		});

		it("should close the modal when the flag save is successful", () => {
			transactionFlagController.save();
			$uibModalInstance.close.should.have.been.calledWith(transaction);
		});

		it("should display an error message when the flag save is unsuccessful", () => {
			transactionFlagController.transaction.id = -1;
			transactionFlagController.save();
			transactionFlagController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("deleteFlag", () => {
		it("should reset any previous error messages", () => {
			transactionFlagController.errorMessage = "error message";
			transactionFlagController.deleteFlag();
			(null === transactionFlagController.errorMessage).should.be.true;
		});

		it("should unflag the transaction", () => {
			transactionFlagController.deleteFlag();
			transactionModel.unflag.should.have.been.calledWith(transaction.id);
		});

		it("should clear transaction's flag", () => {
			transactionFlagController.deleteFlag();
			Boolean(transactionFlagController.transaction.flag).should.be.false;
		});

		it("should close the modal when the flag delete is successful", () => {
			transactionFlagController.deleteFlag();
			$uibModalInstance.close.should.have.been.calledWith(transaction);
		});

		it("should display an error message when the flag delete is unsuccessful", () => {
			transactionFlagController.transaction.id = -1;
			transactionFlagController.deleteFlag();
			transactionFlagController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			transactionFlagController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
