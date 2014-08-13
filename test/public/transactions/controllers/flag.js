(function() {
	"use strict";

	/*jshint expr: true */

	describe("transactionFlagController", function() {
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
			transactionFlagController = controllerTest("transactionFlagController");
		}));

		it("should make the passed transaction available on the $scope", function() {
			transactionFlagController.transaction.should.deep.equal(transaction);
		});

		it("should make the passed transaction's flag memo available on the $scope", function() {
			transactionFlagController.flag.memo.should.deep.equal(transaction.flag);
		});

		it("should set the flagged $scope property on the scope when the transaction has a flag", function() {
			transactionFlagController.flagged.should.be.true;
		});

		it("should set the flagged $scope property on the scope when the transaction doesn't have a flag", function() {
			transaction.flag = undefined;
			transactionFlagController = controllerTest("transactionFlagController");
			transactionFlagController.flagged.should.be.false;
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				transactionFlagController.errorMessage = "error message";
				transactionFlagController.save();
				(null === transactionFlagController.errorMessage).should.be.true;
			});

			it("should call transactionModel.flag() with the transaction", function() {
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

		describe("delete", function() {
			it("should reset any previous error messages", function() {
				transactionFlagController.errorMessage = "error message";
				transactionFlagController.delete();
				(null === transactionFlagController.errorMessage).should.be.true;
			});

			it("should call transactionModel.unflag() with the transaction id", function() {
				transactionFlagController.delete();
				transactionModel.unflag.should.have.been.calledWith(transaction.id);
			});

			it("should clear transaction's flag", function() {
				transactionFlagController.delete();
				(!!transactionFlagController.transaction.flag).should.be.false;
			});

			it("should close the modal when the flag delete is successful", function() {
				transactionFlagController.delete();
				$modalInstance.close.should.have.been.calledWith(transaction);
			});

			it("should display an error message when the flag delete is unsuccessful", function() {
				transactionFlagController.transaction.id = -1;
				transactionFlagController.delete();
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
