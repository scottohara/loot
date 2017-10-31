import AuthenticationEditView from "authentication/views/edit.html";

export default class LayoutController {
	constructor($scope, $window, $transitions, $state, $uibModal, authenticationModel, accountModel, payeeModel, categoryModel, securityModel, ogTableNavigableService, ogViewScrollService, queryService, authenticated) {
		this.$state = $state;
		this.$uibModal = $uibModal;
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

		// Show/hide spinner on all transitions
		$scope.$on("$destroy", $transitions.onStart({}, transition => {
			this.loadingState = true;
			transition.promise.finally(() => (this.loadingState = false));
		}));

		$window.$("#transactionSearch").on("search", () => this.checkIfSearchCleared());
	}

	// Login
	login() {
		this.$uibModal.open({
			templateUrl: AuthenticationEditView,
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

LayoutController.$inject = ["$scope", "$window", "$transitions", "$state", "$uibModal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "ogTableNavigableService", "ogViewScrollService", "queryService", "authenticated"];