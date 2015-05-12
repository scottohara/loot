(function() {
	"use strict";

	/*jshint expr: true */

	describe("AccountDeleteController", function() {
		// The object under test
		var accountDeleteController;

		// Dependencies
		var $modalInstance,
				accountModel,
				account;

		// Load the modules
		beforeEach(module("lootMocks", "lootAccounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "accountModel", "account"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _accountModel_, _account_) {
			$modalInstance = _$modalInstance_;
			accountModel = _accountModel_;
			account = _account_;
			accountDeleteController = controllerTest("AccountDeleteController");
		}));

		it("should make the passed account available to the view", function() {
			account.account_type = account.account_type.charAt(0).toUpperCase() + account.account_type.substr(1);
			account.status = account.status.charAt(0).toUpperCase() + account.status.substr(1);
			accountDeleteController.account.should.deep.equal(account);
		});

		it("should capitalise the account type", function() {
			accountDeleteController.account.account_type.should.equal("Bank");
		});

		it("should capitalise the status", function() {
			accountDeleteController.account.status.should.equal("Open");
		});

		describe("deleteAccount", function() {
			it("should reset any previous error messages", function() {
				accountDeleteController.errorMessage = "error message";
				accountDeleteController.deleteAccount();
				(null === accountDeleteController.errorMessage).should.be.true;
			});

			it("should delete the account", function() {
				accountDeleteController.deleteAccount();
				accountModel.destroy.should.have.been.calledWith(account);
			});

			it("should close the modal when the account delete is successful", function() {
				accountDeleteController.deleteAccount();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the account delete is unsuccessful", function() {
				accountDeleteController.account.id = -1;
				accountDeleteController.deleteAccount();
				accountDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				accountDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
