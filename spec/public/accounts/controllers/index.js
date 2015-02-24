(function() {
	"use strict";

	/*jshint expr: true */

	describe("AccountIndexController", function() {
		// The object under test
		var accountIndexController;

		// Dependencies
		var accountsWithBalances;

		// Load the modules
		beforeEach(module("lootMocks", "lootAccounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["accountsWithBalances"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _accountsWithBalances_) {
			accountsWithBalances = _accountsWithBalances_;
			accountIndexController = controllerTest("AccountIndexController", {"accounts": accountsWithBalances});
		}));

		it("should make the account list available to the view", function() {
			accountIndexController.accounts.should.equal(accountsWithBalances);
		});

		it("should calculate the net worth by summing the account type totals", function() {
			accountIndexController.netWorth.should.equal(200);
		});
	});
})();
