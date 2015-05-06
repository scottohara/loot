(function() {
	"use strict";

	/*jshint expr: true */

	describe("AccountReconcileController", function() {
		// The object under test
		var accountReconcileController;

		// Dependencies
		var controllerTest,
				$modalInstance,
				$window,
				account;

		// Load the modules
		beforeEach(module("lootMocks", "lootAccounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "$window", "account"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modalInstance_, _$window_, _account_) {
			controllerTest = _controllerTest_;
			$modalInstance = _$modalInstance_;
			$window = _$window_;
			account = _account_;
			accountReconcileController = controllerTest("AccountReconcileController");
		}));

		it("should fetch the closing balance from localStorage and make it available to the view", function() {
			$window.localStorage.getItem.should.have.been.calledWith("lootClosingBalance-1");
			accountReconcileController.closingBalance.should.equal(1000);
		});

		it("should expect a postive closing balance to be entered by the user", function() {
			accountReconcileController.expectNegativeBalance.should.be.false;
		});

		["credit", "loan"].forEach(function(accountType) {
			it("should expect a negative closing balance to be entered by the user for " + accountType + " accounts", function() {
				account.account_type = accountType;
				accountReconcileController = controllerTest("AccountReconcileController", {account: account});
				accountReconcileController.expectNegativeBalance.should.be.true;
			});
		});

		describe("start", function() {
			it("should save the closing balance to localStorage", function() {
				accountReconcileController.start();
				$window.localStorage.setItem.should.have.been.calledWith("lootClosingBalance-1", 1000);
			});

			it("should close the modal when the transaction delete is successful", function() {
				accountReconcileController.start();
				$modalInstance.close.should.have.been.calledWith(1000);
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				accountReconcileController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
