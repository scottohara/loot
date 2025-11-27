import type {
	OgTableActionHandlers,
	OgTableActions,
} from "~/og-components/og-table-navigable/types";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import OgModalAlertView from "~/og-components/og-modal-alert/views/alert.html";
import type OgModalErrorService from "~/og-components/og-modal-error/services/og-modal-error";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type { Payee } from "~/payees/types";
import PayeeDeleteView from "~/payees/views/delete.html";
import PayeeEditView from "~/payees/views/edit.html";
import type PayeeModel from "~/payees/models/payee";
import angular from "angular";

export default class PayeeIndexController {
	public readonly tableActions: OgTableActions;

	private readonly showError: (message?: unknown) => void;

	public constructor(
		$scope: angular.IScope,
		$transitions: angular.ui.IStateParamsService,
		private readonly $uibModal: angular.ui.bootstrap.IModalService,
		private readonly $timeout: angular.ITimeoutService,
		private readonly $state: angular.ui.IStateService,
		private readonly payeeModel: PayeeModel,
		private readonly ogTableNavigableService: OgTableNavigableService,
		ogModalErrorService: OgModalErrorService,
		public readonly payees: Payee[],
	) {
		this.tableActions = {
			selectAction: (): angular.IPromise<void> =>
				$state.go(".transactions").catch(this.showError),
			editAction: (index: number): void => this.editPayee(index),
			insertAction: (): void => this.editPayee(),
			deleteAction: (index: number): void => this.deletePayee(index),
			focusAction: (index: number): angular.IPromise<void> =>
				$state
					.go(`${$state.includes("**.payee") ? "^" : ""}.payee`, {
						id: this.payees[index].id,
					})
					.catch(this.showError),
		};

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// If we have a payee id, focus the specified row
		if (undefined !== $state.params.id) {
			this.focusPayee(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on(
			"$destroy",
			$transitions.onSuccess(
				{ to: "root.payees.payee" },
				(transition: angular.ui.IState): number =>
					this.focusPayee(Number(transition.params("to").id)),
			) as () => void,
		);
	}

	private editPayee(index?: number): void {
		// Helper function to sort by payee name
		function byName(a: Payee, b: Payee): number {
			return a.name.localeCompare(b.name);
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal
			.open({
				templateUrl: PayeeEditView,
				controller: "PayeeEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					payee: (): Payee | undefined => {
						let payee: Payee | undefined;

						// If we didn't get an index, we're adding a new payee so just return null
						if (!isNaN(Number(index))) {
							payee = this.payees[Number(index)];

							// Add the payee to the LRU cache
							this.payeeModel.addRecent(payee);
						}

						return payee;
					},
				},
			})
			.result.then((payee: Payee): void => {
				if (isNaN(Number(index))) {
					// Add new payee to the end of the array
					this.payees.push(payee);

					// Add the payee to the LRU cache
					this.payeeModel.addRecent(payee);
				} else {
					// Update the existing payee in the array
					this.payees[Number(index)] = payee;
				}

				// Resort the array
				this.payees.sort(byName);

				// Refocus the payee
				this.focusPayee(Number(payee.id));
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	private deletePayee(index: number): void {
		// Check if the payee can be deleted
		this.payeeModel
			.find(Number(this.payees[index].id))
			.then((payee: Payee): void => {
				// Disable navigation on the table
				this.ogTableNavigableService.enabled = false;

				let modalOptions: angular.ui.bootstrap.IModalSettings = {
					backdrop: "static",
				};

				// Check if the payee has any transactions
				if (payee.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend(
						{
							templateUrl: OgModalAlertView,
							controller: "OgModalAlertController",
							controllerAs: "vm",
							resolve: {
								alert: (): OgModalAlert => ({
									header: "Payee has existing transactions",
									message:
										"You must first delete these transactions, or reassign to another payee before attempting to delete this payee.",
								}),
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				} else {
					// Show the delete payee modal
					modalOptions = angular.extend(
						{
							templateUrl: PayeeDeleteView,
							controller: "PayeeDeleteController",
							controllerAs: "vm",
							resolve: {
								payee: (): Payee => this.payees[index],
							},
						},
						modalOptions,
					) as angular.ui.bootstrap.IModalSettings;
				}

				// Show the modal
				this.$uibModal
					.open(modalOptions)
					.result.then((): void => {
						this.payees.splice(index, 1);
						this.$state.go("root.payees").catch(this.showError);
					})
					.finally((): true => (this.ogTableNavigableService.enabled = true))
					.catch(this.showError);
			})
			.catch(this.showError);
	}

	public toggleFavourite(index: number): void {
		this.payeeModel
			.toggleFavourite(this.payees[index])
			.then(
				(favourite: boolean): boolean =>
					(this.payees[index].favourite = favourite),
			)
			.catch(this.showError);
	}

	// Finds a specific payee and focusses that row in the table
	private focusPayee(payeeIdToFocus: number | string): number {
		const delay = 50;
		let targetIndex = NaN;

		// Find the payee by it's id
		angular.forEach(this.payees, (payee: Payee, index: number): void => {
			if (isNaN(targetIndex) && payee.id === payeeIdToFocus) {
				targetIndex = index;
			}
		});

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

PayeeIndexController.$inject = [
	"$scope",
	"$transitions",
	"$uibModal",
	"$timeout",
	"$state",
	"payeeModel",
	"ogTableNavigableService",
	"ogModalErrorService",
	"payees",
];
