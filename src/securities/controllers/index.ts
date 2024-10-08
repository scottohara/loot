import "~/securities/css/index.css";
import type {
	OgTableActionHandlers,
	OgTableActions,
} from "~/og-components/og-table-navigable/types";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import OgModalAlertView from "~/og-components/og-modal-alert/views/alert.html";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type { Security } from "~/securities/types";
import SecurityDeleteView from "~/securities/views/delete.html";
import SecurityEditView from "~/securities/views/edit.html";
import type SecurityModel from "~/securities/models/security";
import angular from "angular";

export default class SecurityIndexController {
	public readonly tableActions: OgTableActions;

	public totalValue: number;

	private readonly showError: (message?: unknown) => void;

	public constructor(
		$scope: angular.IScope,
		$transitions: angular.ui.IStateParamsService,
		private readonly $uibModal: angular.ui.bootstrap.IModalService,
		private readonly $timeout: angular.ITimeoutService,
		private readonly $state: angular.ui.IStateService,
		private readonly securityModel: SecurityModel,
		private readonly ogTableNavigableService: OgTableNavigableService,
		ogModalErrorService: OgModalErrorService,
		public readonly securities: Security[],
	) {
		const self: this = this,
			decimalPlaces = 2;

		this.totalValue = securities.reduce(
			(memo: number, security: Security): number =>
				memo + Number(Number(security.closing_balance).toFixed(decimalPlaces)),
			0,
		);

		this.tableActions = {
			selectAction(): void {
				$state.go(".transactions").catch(self.showError);
			},
			editAction(index: number): void {
				self.editSecurity(index);
			},
			insertAction(): void {
				self.editSecurity();
			},
			deleteAction(index: number): void {
				self.deleteSecurity(index);
			},
			focusAction(index: number): void {
				$state
					.go(`${$state.includes("**.security") ? "^" : ""}.security`, {
						id: self.securities[index].id,
					})
					.catch(self.showError);
			},
		};

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// If we have a security id, focus the specified row
		if (!isNaN(Number($state.params.id))) {
			this.focusSecurity(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on(
			"$destroy",
			$transitions.onSuccess(
				{ to: "root.securities.security" },
				(transition: angular.ui.IState): number =>
					this.focusSecurity(Number(transition.params("to").id)),
			) as () => void,
		);
	}

	public editSecurity(index?: number): void {
		// Helper function to sort by security current holding and name
		function byHoldingAndName(a: Security, b: Security): number {
			let x: boolean, y: boolean;

			if (a.unused === b.unused) {
				if (a.current_holding > 0 === b.current_holding > 0) {
					return a.name.localeCompare(b.name);
				}

				x = a.current_holding <= 0;
				y = b.current_holding <= 0;
			} else {
				x = a.unused;
				y = b.unused;
			}

			return Number(x) - Number(y);
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal
			.open({
				templateUrl: SecurityEditView,
				controller: "SecurityEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					security: (): Security | undefined => {
						let security: Security | undefined;

						// If we didn't get an index, we're adding a new security so just return null
						if (!isNaN(Number(index))) {
							security = this.securities[Number(index)];

							// Add the security to the LRU cache
							this.securityModel.addRecent(security);
						}

						return security;
					},
				},
			})
			.result.then((security: Security): void => {
				if (isNaN(Number(index))) {
					// Add new security to the end of the array
					this.securities.push(security);

					// Add the security to the LRU cache
					this.securityModel.addRecent(security);
				} else {
					// Update the existing security in the array
					this.securities[Number(index)] = security;
				}

				// Resort the array
				this.securities.sort(byHoldingAndName);

				// Refocus the security
				this.focusSecurity(Number(security.id));
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	public deleteSecurity(index: number): void {
		// Check if the security can be deleted
		this.securityModel
			.find(Number(this.securities[index].id))
			.then((security: Security): void => {
				// Disable navigation on the table
				this.ogTableNavigableService.enabled = false;

				let modalOptions: angular.ui.bootstrap.IModalSettings = {
					backdrop: "static",
				};

				// Check if the security has any transactions
				if (security.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend(
						{
							templateUrl: OgModalAlertView,
							controller: "OgModalAlertController",
							controllerAs: "vm",
							resolve: {
								alert: (): OgModalAlert => ({
									header: "Security has existing transactions",
									message:
										"You must first delete these transactions, or reassign to another security before attempting to delete this security.",
								}),
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				} else {
					// Show the delete security modal
					modalOptions = angular.extend(
						{
							templateUrl: SecurityDeleteView,
							controller: "SecurityDeleteController",
							controllerAs: "vm",
							resolve: {
								security: (): Security => this.securities[index],
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				}

				// Show the modal
				this.$uibModal
					.open(modalOptions)
					.result.then((): void => {
						this.securities.splice(index, 1);
						this.$state.go("root.securities").catch(this.showError);
					})
					.finally((): true => (this.ogTableNavigableService.enabled = true))
					.catch(this.showError);
			})
			.catch(this.showError);
	}

	public toggleFavourite(index: number): void {
		this.securityModel
			.toggleFavourite(this.securities[index])
			.then(
				(favourite: boolean): boolean =>
					(this.securities[index].favourite = favourite),
			)
			.catch(this.showError);
	}

	// Finds a specific security and focusses that row in the table
	private focusSecurity(securityIdToFocus: number | string): number {
		const delay = 50;
		let targetIndex = NaN;

		// Find the security by it's id
		angular.forEach(
			this.securities,
			(security: Security, index: number): void => {
				if (isNaN(targetIndex) && security.id === securityIdToFocus) {
					targetIndex = index;
				}
			},
		);

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout(
				(): void =>
					(this.tableActions as OgTableActionHandlers).focusRow(targetIndex),
				delay,
			).catch(this.showError);
		}

		return targetIndex;
	}
}

SecurityIndexController.$inject = [
	"$scope",
	"$transitions",
	"$uibModal",
	"$timeout",
	"$state",
	"securityModel",
	"ogTableNavigableService",
	"ogModalErrorService",
	"securities",
];
