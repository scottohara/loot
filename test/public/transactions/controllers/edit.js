(function() {
	"use strict";

	/*jshint expr: true */

	describe.only("transactionEditController", function() {
		// The object under test
		var transactionEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				payeeModel,
				securityModel,
				categoryModel,
				accountModel,
				transactionModel,
				transaction,
				mockJQueryInstance,
				realJQueryInstance;

		// Load the modules
		beforeEach(module("lootMocks", "transactions", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "transaction"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _payeeModel_, _securityModel_, _categoryModel_, _accountModel_, _transactionModel_, _transaction_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			payeeModel = _payeeModel_;
			securityModel = _securityModel_;
			categoryModel = _categoryModel_;
			accountModel = _accountModel_;
			transactionModel = _transactionModel_;
			transaction = _transaction_;
			mockJQueryInstance = {
				focus: sinon.stub()
			};

			realJQueryInstance = window.$;
			window.$ = sinon.stub();
			window.$.withArgs("#transactionDate").returns(mockJQueryInstance);

			transactionEditController = controllerTest("transactionEditController");
		}));

		afterEach(function() {
			window.$ = realJQueryInstance;
		});

		describe("when a transaction is provided", function() {
			it("should make the passed transaction available on the $scope", function() {
				transactionEditController.transaction.should.deep.equal(transaction);
			});
			
			it("should set the mode to Edit", function() {
				transactionEditController.mode.should.equal("Edit");
			});
		});

		describe.skip("when a transaction is not provided", function() {
			beforeEach(function() {
				transaction = undefined;
				transactionEditController = controllerTest("transactionEditController");
			});

			it("should set an empty transaction object on the $scope", function() {
				transactionEditController.transaction.should.be.an.Object;
				transactionEditController.transaction.should.be.empty;
			});

			it("should set the mode to Add", function() {
				transactionEditController.mode.should.equal("Add");
			});
		});

		it("should focus the transaction date field", function() {
			mockJQueryInstance.focus.should.have.been.called;
		});

		it("should prefetch the payees list to populate the cache", function() {
			payeeModel.all.should.have.been.called;
		});

		describe("payees", function() {
			//TODO
		});

		describe("securities", function() {
			//TODO
		});

		describe("categories", function() {
			//TODO
		});

		describe("investmentCategories", function() {
			//TODO
		});

		describe("isString", function() {
			//TODO
		});
		
		describe("payeeSeleted", function() {
			//TODO
		});

		describe("securitySelected", function() {
			//TODO
		});

		describe("getSubtransactions", function() {
			//TODO
		});
		
		describe("useLastTransaction", function() {
			//TODO
		});

		describe("categorySelected", function() {
			//TODO
		});

		describe("investmentCategorySelected", function() {
			//TODO
		});

		//TODO - watch the subtransactions array

		describe("accounts", function() {
			//TODO
		});

		describe("addSubtransaction", function() {
			//TODO
		});

		describe("deleteSubtransaction", function() {
			//TODO
		});

		describe("updateInvestmentDetails", function() {
			//TODO
		});

		describe("updateLruCaches", function() {
			//TODO
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				transactionEditController.errorMessage = "error message";
				transactionEditController.save();
				(null === transactionEditController.errorMessage).should.be.true;
			});

			it("should call transactionModel.save() with the transaction", function() {
				transactionEditController.save();
				transactionModel.save.should.have.been.calledWith(transaction);
			});

			it("should update the LRU caches", function() {
				transactionEditController.save();
				//TODO
			});

			it("should close the modal when the transaction save is successful", function() {
				transactionEditController.save();
				$modalInstance.close.should.have.been.calledWith(transaction);
			});

			it("should display an error message when login unsuccessful", function() {
				transactionEditController.transaction.id = -1;
				transactionEditController.save();
				transactionEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				transactionEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
