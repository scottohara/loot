import AccountModel from "accounts/models/account";
import AuthenticationEditView from "authentication/views/edit.html";
import AuthenticationModel from "authentication/models/authentication";
import CategoryModel from "categories/models/category";
import {IModalService} from "angular-ui-bootstrap";
import {OgCacheEntry} from "og-components/og-lru-cache-factory/types";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import OgViewScrollService from "og-components/og-view-scroll/services/og-view-scroll";
import PayeeModel from "payees/models/payee";
import QueryService from "transactions/services/query";
import SecurityModel from "securities/models/security";

export default class LayoutController {
	private isLoadingState: boolean = false;

	public constructor($scope: angular.IScope, $window: angular.IWindowService, $transitions: angular.ui.IStateParamsService,
											private readonly $state: angular.ui.IStateService,
											private readonly $uibModal: IModalService,
											private readonly authenticationModel: AuthenticationModel,
											private readonly accountModel: AccountModel,
											private readonly payeeModel: PayeeModel,
											private readonly categoryModel: CategoryModel,
											private readonly securityModel: SecurityModel,
											private readonly ogTableNavigableService: OgTableNavigableService, ogViewScrollService: OgViewScrollService,
											public readonly queryService: QueryService,
											public readonly authenticated: boolean) {
		this.scrollTo = ogViewScrollService.scrollTo.bind(ogViewScrollService);

		// Show/hide spinner on all transitions
		$scope.$on("$destroy", $transitions.onStart({}, (transition: angular.ui.IStateParamsService): void => {
			this.loadingState = true;
			transition.promise.finally((): false => (this.loadingState = false));
		}));

		$window.$("#transactionSearch").on("search", (): void => this.checkIfSearchCleared());
	}

	public readonly scrollTo: (anchor: string) => void;

	// Login
	public login(): void {
		this.$uibModal.open({
			templateUrl: AuthenticationEditView,
			controller: "AuthenticationEditController",
			controllerAs: "vm",
			backdrop: "static",
			size: "sm"
		}).result.then((): angular.IPromise<void> => this.$state.reload());
	}

	// Logout
	public logout(): void {
		this.authenticationModel.logout();
		this.$state.reload();
	}

	// Search
	public search(): void {
		if ("" !== this.queryService.query) {
			this.$state.go("root.transactions", {
				query: this.queryService.query
			});
		}
	}

	// Disable/enable any table key-bindings
	public toggleTableNavigationEnabled(state: boolean): void {
		this.ogTableNavigableService.enabled = state;
	}

	// Recently accessed lists
	public get recentlyAccessedAccounts(): OgCacheEntry[] {
		return this.accountModel.recent;
	}

	public get recentlyAccessedPayees(): OgCacheEntry[] {
		return this.payeeModel.recent;
	}

	public get recentlyAccessedCategories(): OgCacheEntry[] {
		return this.categoryModel.recent;
	}

	public get recentlyAccessedSecurities(): OgCacheEntry[] {
		return this.securityModel.recent;
	}

	public get loadingState(): boolean {
		return this.isLoadingState;
	}

	public set loadingState(loading: boolean) {
		this.isLoadingState = loading;
	}

	private checkIfSearchCleared(): void {
		// When the search field is cleared, return to the previous state
		if ("" === this.queryService.query && this.queryService.previousState) {
			this.$state.go(String(this.queryService.previousState.name), this.queryService.previousState.params);
			this.queryService.previousState = null;
		}
	}
}

LayoutController.$inject = ["$scope", "$window", "$transitions", "$state", "$uibModal", "authenticationModel", "accountModel", "payeeModel", "categoryModel", "securityModel", "ogTableNavigableService", "ogViewScrollService", "queryService", "authenticated"];