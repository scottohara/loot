(function() {
	"use strict";

	/*jshint expr: true */

	describe("accountIndexController", function() {
		// The object under test
		var accountIndexController;

		// Dependencies
		var accountsWithBalances;

		// Load the modules
		beforeEach(module("lootMocks", "accounts", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["accountsWithBalances"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _accountsWithBalances_) {
			accountsWithBalances = _accountsWithBalances_;
			accountIndexController = controllerTest("accountIndexController", {"accounts": accountsWithBalances});
		}));

		it("should make the account list available on the $scope", function() {
			accountIndexController.accounts.should.equal(accountsWithBalances);
		});

		it("should calculate the net worth by summing the account type totals", function() {
			accountIndexController.netWorth.should.equal(200);
		});
	});
})();
