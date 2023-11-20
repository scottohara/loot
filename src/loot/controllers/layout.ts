import type AccountModel from "~/accounts/models/account";
import AuthenticationEditView from "~/authentication/views/edit.html";
import type AuthenticationModel from "~/authentication/models/authentication";
import type CategoryModel from "~/categories/models/category";
import type { OgCacheEntry } from "~/og-components/og-lru-cache-factory/types";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type OgViewScrollService from "~/og-components/og-view-scroll/services/og-view-scroll";
import type PayeeModel from "~/payees/models/payee";
import type QueryService from "~/transactions/services/query";
import type SecurityModel from "~/securities/models/security";

export default class LayoutController {
	public readonly scrollTo: (anchor: string) => void;

	public navCollapsed = true;

	private readonly showError: (message?: string) => void;

	private isLoadingState = false;

	public constructor(
		$scope: angular.IScope,
		$window: angular.IWindowService,
		$transitions: angular.ui.IStateParamsService,
		private readonly $state: angular.ui.IStateService,
		private readonly $uibModal: angular.ui.bootstrap.IModalService,
		private readonly authenticationModel: AuthenticationModel,
		private readonly accountModel: AccountModel,
		private readonly payeeModel: PayeeModel,
		private readonly categoryModel: CategoryModel,
		private readonly securityModel: SecurityModel,
		private readonly ogTableNavigableService: OgTableNavigableService,
		ogViewScrollService: OgViewScrollService,
		public readonly queryService: QueryService,
		ogModalErrorService: OgModalErrorService,
		public readonly authenticated: boolean,
	) {
		this.scrollTo = ogViewScrollService.scrollTo.bind(ogViewScrollService);

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// Show/hide spinner on all transitions
		$scope.$on(
			"$destroy",
			$transitions.onStart(
				{},
				(transition: angular.ui.IStateParamsService): void => {
					this.loadingState = true;
					this.navCollapsed = true;
					transition.promise.finally((): false => (this.loadingState = false));
				},
			) as () => void,
		);

		$window
			.$("#transactionSearch")
			.on("search", (): void => this.checkIfSearchCleared());
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

	// Login
	public login(): void {
		this.$uibModal
			.open({
				templateUrl: AuthenticationEditView,
				controller: "AuthenticationEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "sm",
			})
			.result.then((): angular.IPromise<void> => this.$state.reload())
			.catch(this.showError);
	}

	// Logout
	public logout(): void {
		this.authenticationModel.logout();
		this.$state.reload().catch(this.showError);
	}

	// Search
	public search(): void {
		if ("" !== this.queryService.query) {
			this.$state
				.go("root.transactions", {
					query: this.queryService.query,
				})
				.catch(this.showError);
		}
	}

	// Disable/enable any table key-bindings
	public toggleTableNavigationEnabled(state: boolean): void {
		this.ogTableNavigableService.enabled = state;
	}

	private checkIfSearchCleared(): void {
		// When the search field is cleared, return to the previous state
		if (
			"" === this.queryService.query &&
			null !== this.queryService.previousState
		) {
			this.$state
				.go(
					String(this.queryService.previousState.name),
					this.queryService.previousState.params as undefined,
				)
				.catch(this.showError);
			this.queryService.previousState = null;
		}
	}
}

LayoutController.$inject = [
	"$scope",
	"$window",
	"$transitions",
	"$state",
	"$uibModal",
	"authenticationModel",
	"accountModel",
	"payeeModel",
	"categoryModel",
	"securityModel",
	"ogTableNavigableService",
	"ogViewScrollService",
	"queryService",
	"ogModalErrorService",
	"authenticated",
];
