import {
	IModalService,
	IModalSettings
} from "angular-ui-bootstrap";
import {
	OgTableActionHandlers,
	OgTableActions
} from "og-components/og-table-navigable/types";
import {OgModalAlert} from "og-components/og-modal-alert/types";
import OgModalAlertView from "og-components/og-modal-alert/views/alert.html";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import {Payee} from "payees/types";
import PayeeDeleteView from "payees/views/delete.html";
import PayeeEditView from "payees/views/edit.html";
import PayeeModel from "payees/models/payee";
import angular from "angular";

export default class PayeeIndexController {
	public readonly tableActions: OgTableActions;

	public constructor($scope: angular.IScope, $transitions: angular.ui.IStateParamsService,
											private readonly $uibModal: IModalService,
											private readonly $timeout: angular.ITimeoutService,
											private readonly $state: angular.ui.IStateService,
											private readonly payeeModel: PayeeModel,
											private readonly ogTableNavigableService: OgTableNavigableService,
											public readonly payees: Payee[]) {
		const self: this = this;

		this.tableActions = {
			selectAction(): void {
				$state.go(".transactions");
			},
			editAction(index: number): void {
				self.editPayee(index);
			},
			insertAction(): void {
				self.editPayee();
			},
			deleteAction(index: number): void {
				self.deletePayee(index);
			},
			focusAction(index: number): void {
				$state.go(`${$state.includes("**.payee") ? "^" : ""}.payee`, {id: self.payees[index].id});
			},
			focusRow(): void {}
		};

		// If we have a payee id, focus the specified row
		if (Number($state.params.id)) {
			this.focusPayee(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on("$destroy", $transitions.onSuccess({to: "root.payees.payee"}, (transition: angular.ui.IState): number => this.focusPayee(Number(transition.params("to").id))));
	}

	public editPayee(index?: number): void {
		// Helper function to sort by payee name
		function byName(a: Payee, b: Payee): number {
			return a.name.localeCompare(b.name);
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: PayeeEditView,
			controller: "PayeeEditController",
			controllerAs: "vm",
			backdrop: "static",
			resolve: {
				payee: (): Payee | null => {
					let payee: Payee | null = null;

					// If we didn't get an index, we're adding a new payee so just return null
					if (!isNaN(Number(index))) {
						payee = this.payees[Number(index)];

						// Add the payee to the LRU cache
						this.payeeModel.addRecent(payee);
					}

					return payee;
				}
			}
		}).result.then((payee: Payee): void => {
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
			this.focusPayee(payee.id);
		}).finally((): true => (this.ogTableNavigableService.enabled = true));
	}

	public deletePayee(index: number): void {
		// Check if the payee can be deleted
		this.payeeModel.find(this.payees[index].id).then((payee: Payee): void => {
			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			let modalOptions: IModalSettings = {
				backdrop: "static"
			};

			// Check if the payee has any transactions
			if (payee.num_transactions > 0) {
				// Show an alert modal
				modalOptions = angular.extend({
					templateUrl: OgModalAlertView,
					controller: "OgModalAlertController",
					controllerAs: "vm",
					resolve: {
						alert: (): OgModalAlert => ({
							header: "Payee has existing transactions",
							message: "You must first delete these transactions, or reassign to another payee before attempting to delete this payee."
						})
					}
				}, modalOptions);
			} else {
				// Show the delete payee modal
				modalOptions = angular.extend({
					templateUrl: PayeeDeleteView,
					controller: "PayeeDeleteController",
					controllerAs: "vm",
					resolve: {
						payee: (): Payee => this.payees[index]
					}
				}, modalOptions);
			}

			// Show the modal
			this.$uibModal.open(modalOptions).result.then((): void => {
				this.payees.splice(index, 1);
				this.$state.go("root.payees");
			}).finally((): true => (this.ogTableNavigableService.enabled = true));
		});
	}

	public toggleFavourite(index: number): void {
		this.payeeModel.toggleFavourite(this.payees[index]).then((favourite: boolean): boolean => (this.payees[index].favourite = favourite));
	}

	// Finds a specific payee and focusses that row in the table
	private focusPayee(payeeIdToFocus: string | number): number {
		const delay: number = 50;
		let targetIndex: number = NaN;

		// Find the payee by it's id
		angular.forEach(this.payees, (payee: Payee, index: number): void => {
			if (isNaN(targetIndex) && payee.id === payeeIdToFocus) {
				targetIndex = index;
			}
		});

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout((): void => (this.tableActions as OgTableActionHandlers).focusRow(targetIndex), delay);
		}

		return targetIndex;
	}
}

PayeeIndexController.$inject = ["$scope", "$transitions", "$uibModal", "$timeout", "$state", "payeeModel", "ogTableNavigableService", "payees"];