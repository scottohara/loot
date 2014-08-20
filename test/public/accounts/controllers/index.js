(function() {
	"use strict";

	/*jshint expr: true */

	describe("accountIndexController", function() {
		// The object under test
		var accountIndexController;

		// Dependencies
		var accountModel;

		// Load the modules
		beforeEach(module("lootMocks", "accounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["accountModel"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _accountModel_) {
			accountModel = _accountModel_;
			accountIndexController = controllerTest("accountIndexController");
		}));

		it("should fetch the list of accounts with balances", function() {
			accountModel.allWithBalances.should.have.been.called;
		});

		it("should make the account list available on the $scope", function() {
			accountIndexController.accounts.should.equal(accountModel.accounts);
		});

		it("should calculate the net worth by summing the account type totals", function() {
			accountIndexController.netWorth.should.equal(200);
		});
	});
})();
