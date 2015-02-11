(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("loot");

	// Declare the Layout controller
	mod.controller("layoutController", ["$state", "$modal", "$uiViewScroll", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "ogTableNavigableService", "queryService", "authenticated",
		function($state, $modal, $uiViewScroll, authenticationModel, accountModel, payeeModel, categoryModel, securityModel, ogTableNavigableService, queryService, authenticated) {
			// Make the authentication status available on the scope
			this.authenticated = authenticated;

			// Make the query available on the scope
			this.query = queryService.getQuery();

			// Login
			this.login = function() {
				$modal.open({
					templateUrl: "authentication/views/edit.html",
					controller: "authenticationEditController",
					backdrop: "static",
					size: "sm"
				}).result.then(function() {
					$state.reload();
				});
			};

			// Logout
			this.logout = function() {
				authenticationModel.logout();
				$state.reload();
			};

			// Search
			this.search = function() {
				queryService.setQuery(this.query);

				$state.go("root.transactions", {
					query: this.query
				});
			};

			// Disable/enable any table key-bindings
			this.toggleTableNavigationEnabled = function(state) {
				ogTableNavigableService.enabled = state;
			};

			// Recently accessed lists
			this.recentlyAccessedAccounts = function() {
				return accountModel.recent;
			};

			this.recentlyAccessedPayees = function() {
				return payeeModel.recent;
			};

			this.recentlyAccessedCategories = function() {
				return categoryModel.recent;
			};

			this.recentlyAccessedSecurities = function() {
				return securityModel.recent;
			};

			// Scrolling
			this.scrollTo = function(anchor) {
				$uiViewScroll($("#" + anchor));
			};
		}
	]);
})();
