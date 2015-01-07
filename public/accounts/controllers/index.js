(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accounts");

	// Declare the Account Index controller
	mod.controller("accountIndexController", ["$scope", "accounts",
		function($scope, accounts) {
			$scope.accounts = accounts;
			$scope.netWorth = Object.keys(accounts).reduce(function(netWorth, accountType) {
				return netWorth + accounts[accountType].total;
			}, 0);
		}
	]);
})();
