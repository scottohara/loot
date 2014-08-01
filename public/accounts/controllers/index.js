(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accounts");

	// Declare the Account Index controller
	mod.controller("accountIndexController", ["$scope", "accountModel",
		function($scope, accountModel) {
			accountModel.allWithBalances().then(function(accounts) {
				$scope.accounts = accounts;
				$scope.netWorth = Object.keys(accounts).reduce(function(netWorth, accountType) {
					return netWorth + accounts[accountType].total;
				}, 0);
			});
		}
	]);
})();
