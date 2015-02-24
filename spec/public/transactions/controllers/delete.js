(function() {
	"use strict";

	/*jshint expr: true */

	describe("TransactionDeleteController", function() {
		// The object under test
		var transactionDeleteController;

		// Dependencies
		var $modalInstance,
				transactionModel,
				transaction;

		// Load the modules
		beforeEach(module("lootMocks", "lootTransactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "transactionModel", "transaction"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _transactionModel_, _transaction_) {
			$modalInstance = _$modalInstance_;
			transactionModel = _transactionModel_;
			transaction = _transaction_;
			transactionDeleteController = controllerTest("TransactionDeleteController");
		}));

		it("should make the passed transaction available to the view", function() {
			transactionDeleteController.transaction.should.deep.equal(transaction);
		});

		describe("deleteTransaction", function() {
			it("should reset any previous error messages", function() {
				transactionDeleteController.errorMessage = "error message";
				transactionDeleteController.deleteTransaction();
				(null === transactionDeleteController.errorMessage).should.be.true;
			});

			it("should delete the transaction", function() {
				transactionDeleteController.deleteTransaction();
				transactionModel.destroy.should.have.been.calledWith(transaction);
			});

			it("should close the modal when the transaction delete is successful", function() {
				transactionDeleteController.deleteTransaction();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the transaction delete is unsuccessful", function() {
				transactionDeleteController.transaction.id = -1;
				transactionDeleteController.deleteTransaction();
				transactionDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				transactionDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
