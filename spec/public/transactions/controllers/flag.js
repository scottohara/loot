(function() {
	"use strict";

	/*jshint expr: true */

	describe("TransactionFlagController", function() {
		// The object under test
		var transactionFlagController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				transactionModel,
				transaction;

		// Load the modules
		beforeEach(module("lootMocks", "transactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "transactionModel", "transaction"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _transactionModel_, _transaction_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			transactionModel = _transactionModel_;
			transaction = _transaction_;
			transactionFlagController = controllerTest("TransactionFlagController");
		}));

		it("should make the passed transaction available to the view", function() {
			transactionFlagController.transaction.should.deep.equal(transaction);
		});

		it("should make the passed transaction's flag memo available to the view", function() {
			transactionFlagController.flag.should.deep.equal(transaction.flag);
		});

		it("should set the flag to null when transaction's flag memo is '(no memo)'", function() {
			transaction.flag = "(no memo)";
			transactionFlagController = controllerTest("TransactionFlagController");
			(null === transactionFlagController.flag).should.be.true;
		});

		it("should set the flagged property when the transaction has a flag", function() {
			transactionFlagController.flagged.should.be.true;
		});

		it("should clear the flagged property when the transaction doesn't have a flag", function() {
			transaction.flag = undefined;
			transactionFlagController = controllerTest("TransactionFlagController");
			transactionFlagController.flagged.should.be.false;
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				transactionFlagController.errorMessage = "error message";
				transactionFlagController.save();
				(null === transactionFlagController.errorMessage).should.be.true;
			});

			it("should flag the transaction", function() {
				transactionFlagController.save();
				transactionModel.flag.should.have.been.calledWith(transaction);
			});

			it("should set the flag memo to '(no memo)' if the memo is blank", function() {
				transactionFlagController.flag = null;
				transaction.flag = "(no memo)";
				transactionFlagController.save();
				transactionModel.flag.should.have.been.calledWith(transaction);
			});

			it("should close the modal when the flag save is successful", function() {
				transactionFlagController.save();
				$modalInstance.close.should.have.been.calledWith(transaction);
			});

			it("should display an error message when the flag save is unsuccessful", function() {
				transactionFlagController.transaction.id = -1;
				transactionFlagController.save();
				transactionFlagController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("deleteFlag", function() {
			it("should reset any previous error messages", function() {
				transactionFlagController.errorMessage = "error message";
				transactionFlagController.deleteFlag();
				(null === transactionFlagController.errorMessage).should.be.true;
			});

			it("should unflag the transaction", function() {
				transactionFlagController.deleteFlag();
				transactionModel.unflag.should.have.been.calledWith(transaction.id);
			});

			it("should clear transaction's flag", function() {
				transactionFlagController.deleteFlag();
				(!!transactionFlagController.transaction.flag).should.be.false;
			});

			it("should close the modal when the flag delete is successful", function() {
				transactionFlagController.deleteFlag();
				$modalInstance.close.should.have.been.calledWith(transaction);
			});

			it("should display an error message when the flag delete is unsuccessful", function() {
				transactionFlagController.transaction.id = -1;
				transactionFlagController.deleteFlag();
				transactionFlagController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				transactionFlagController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
