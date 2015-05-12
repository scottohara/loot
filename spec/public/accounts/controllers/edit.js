(function() {
	"use strict";

	/*jshint expr: true */

	describe("AccountEditController", function() {
		// The object under test
		var accountEditController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				accountModel,
				account;

		// Load the modules
		beforeEach(module("lootMocks", "lootAccounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "accountModel", "account"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _accountModel_, _account_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			accountModel = _accountModel_;
			account = _account_;
			accountEditController = controllerTest("AccountEditController");
		}));

		describe("when an account is provided", function() {
			it("should make the passed account available to the view", function() {
				account.account_type = account.account_type.charAt(0).toUpperCase() + account.account_type.substr(1);
				account.status = account.status.charAt(0).toUpperCase() + account.status.substr(1);
				accountEditController.account.should.deep.equal(account);
			});
			
			it("should set the mode to Edit", function() {
				accountEditController.mode.should.equal("Edit");
			});

			it("should capitalise the account type", function() {
				accountEditController.account.account_type.should.equal("Bank");
			});

			it("should capitalise the status", function() {
				accountEditController.account.status.should.equal("Open");
			});
		});

		describe("when an account is not provided", function() {
			beforeEach(function() {
				accountEditController = controllerTest("AccountEditController", {account: undefined});
			});

			it("should make an empty account object available to the view", function() {
				accountEditController.account.should.deep.equal({opening_balance: 0});
			});

			it("should set the mode to Add", function() {
				accountEditController.mode.should.equal("Add");
			});
		});

		describe("accountTypes", function() {
			it("should return a filtered & limited list of account types", function() {
				accountEditController.accountTypes("t", 2).should.deep.equal(["Asset", "Credit"]);
			});
		});

		describe("accountTypeSelected", function() {
			it("should reset the related account if the account type is investment", function() {
				accountEditController.account.account_type = "Investment";
				accountEditController.account.related_account = "related account";
				accountEditController.accountTypeSelected();
				accountEditController.account.related_account.should.deep.equal({opening_balance: 0});
			});

			it("should clear the related account if the account type is not investment", function() {
				accountEditController.account.related_account = "related account";
				accountEditController.accountTypeSelected();
				(null === accountEditController.account.related_account).should.be.true;
			});
		});

		describe("accounts", function() {
			it("should fetch the list of accounts", function() {
				accountEditController.accounts();
				accountModel.all.should.have.been.called;
			});

			it("should return a filtered & limited list of asset accounts", function() {
				accountEditController.accounts("b", 2).should.eventually.deep.equal([
					{id: 4, name: "ba", account_type: "asset"},
					{id: 5, name: "ab", account_type: "asset"}
				]);
			});
		});

		describe("save", function() {
			it("should reset any previous error messages", function() {
				accountEditController.errorMessage = "error message";
				accountEditController.save();
				(null === accountEditController.errorMessage).should.be.true;
			});

			it("should convert the account type to lower case", function() {
				accountEditController.save();
				accountEditController.account.account_type.should.equal("bank");
			});

			it("should convert the status to lower case", function() {
				accountEditController.save();
				accountEditController.account.status.should.equal("open");
			});

			it("should save the account", function() {
				accountEditController.save();
				accountModel.save.should.have.been.calledWith(account);
			});

			it("should close the modal when the account save is successful", function() {
				accountEditController.save();
				$modalInstance.close.should.have.been.calledWith(account);
			});

			it("should display an error message when the account save is unsuccessful", function() {
				accountEditController.account.id = -1;
				accountEditController.save();
				accountEditController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				accountEditController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
