(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("loot")
		.controller("LayoutController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$state", "$modal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "ogTableNavigableService", "ogViewScrollService", "queryService", "authenticated"];

	/**
	 * Implementation
	 */
	function Controller($state, $modal, authenticationModel, accountModel, payeeModel, categoryModel, securityModel, ogTableNavigableService, ogViewScrollService, queryService, authenticated) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.authenticated = authenticated;
		vm.queryService = queryService;
		vm.login = login;
		vm.logout = logout;
		vm.search = search;
		vm.toggleTableNavigationEnabled = toggleTableNavigationEnabled;
		vm.recentlyAccessedAccounts = recentlyAccessedAccounts;
		vm.recentlyAccessedPayees = recentlyAccessedPayees;
		vm.recentlyAccessedCategories = recentlyAccessedCategories;
		vm.recentlyAccessedSecurities = recentlyAccessedSecurities;
		vm.scrollTo = ogViewScrollService.scrollTo;

		/**
		 * Implementation
		 */
	
		// Login
		function login() {
			$modal.open({
				templateUrl: "authentication/views/edit.html",
				controller: "AuthenticationEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm"
			}).result.then(function() {
				$state.reload();
			});
		}

		// Logout
		function logout() {
			authenticationModel.logout();
			$state.reload();
		}

		// Search
		function search() {
			$state.go("root.transactions", {
				query: vm.queryService.query
			});
		}

		// Disable/enable any table key-bindings
		function toggleTableNavigationEnabled(state) {
			ogTableNavigableService.enabled = state;
		}

		// Recently accessed lists
		function recentlyAccessedAccounts() {
			return accountModel.recent;
		}

		function recentlyAccessedPayees() {
			return payeeModel.recent;
		}

		function recentlyAccessedCategories() {
			return categoryModel.recent;
		}

		function recentlyAccessedSecurities() {
			return securityModel.recent;
		}
	}
})();
