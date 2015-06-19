{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($scope, $state, $modal, authenticationModel, accountModel, payeeModel, categoryModel, securityModel, ogTableNavigableService, ogViewScrollService, queryService, authenticated) {
			this.$scope = $scope;
			this.$state = $state;
			this.$modal = $modal;
			this.authenticationModel = authenticationModel;
			this.accountModel = accountModel;
			this.payeeModel = payeeModel;
			this.categoryModel = categoryModel;
			this.securityModel = securityModel;
			this.ogTableNavigableService = ogTableNavigableService;
			this.queryService = queryService;
			this.authenticated = authenticated;
			this.isLoadingState = false;
			this.scrollTo = ogViewScrollService.scrollTo.bind(ogViewScrollService);

			// Handlers are wrapped in functions to aid with unit testing
			$scope.$on("$stateChangeStart", () => this.loadingState = true);
			$scope.$on("$stateChangeSuccess", () => this.loadingState = false);
			$scope.$on("$stateChangeError", () => this.loadingState = false);
			$("#transactionSearch").on("search", () => this.checkIfSearchCleared());
		}

		/**
		 * Implementation
		 */

		// Login
		login() {
			this.$modal.open({
				templateUrl: "authentication/views/edit.html",
				controller: "AuthenticationEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm"
			}).result.then(() => this.$state.reload());
		}

		// Logout
		logout() {
			this.authenticationModel.logout();
			this.$state.reload();
		}

		// Search
		search() {
			if ("" !== this.queryService.query) {
				this.$state.go("root.transactions", {
					query: this.queryService.query
				});
			}
		}

		// Disable/enable any table key-bindings
		toggleTableNavigationEnabled(state) {
			this.ogTableNavigableService.enabled = state;
		}

		// Recently accessed lists
		get recentlyAccessedAccounts() {
			return this.accountModel.recent;
		}

		get recentlyAccessedPayees() {
			return this.payeeModel.recent;
		}

		get recentlyAccessedCategories() {
			return this.categoryModel.recent;
		}

		get recentlyAccessedSecurities() {
			return this.securityModel.recent;
		}

		get loadingState() {
			return this.isLoadingState;
		}

		set loadingState(loading) {
			this.isLoadingState = loading;
		}

		checkIfSearchCleared() {
			// When the search field is cleared, return to the previous state
			if ("" === this.queryService.query && this.queryService.previousState) {
				this.$state.go(this.queryService.previousState.name, this.queryService.previousState.params);
				this.queryService.previousState = null;
			}
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootApp")
		.controller("LayoutController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$state", "$modal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "ogTableNavigableService", "ogViewScrollService", "queryService", "authenticated"];
}
