(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["accounts"];

	/**
	 * Implementation
	 */
	function Controller(accounts) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.accounts = accounts;
		vm.netWorth = Object.keys(accounts).reduce(netWorth, 0);

		/**
		 * Implementation
		 */
		function netWorth(memo, accountType) {
			return memo + accounts[accountType].total;
		}
	}
})();
