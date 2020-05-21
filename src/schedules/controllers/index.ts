import "transactions/css/index.less";
import {
	OgTableActionHandlers,
	OgTableActions
} from "og-components/og-table-navigable/types";
import {
	SplitTransaction,
	SplitTransactionChild
} from "transactions/types";
import {
	isEqual,
	startOfDay
} from "date-fns";
import OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import ScheduleDeleteView from "schedules/views/delete.html";
import ScheduleEditView from "schedules/views/edit.html";
import { ScheduledTransaction } from "schedules/types";
import TransactionModel from "transactions/models/transaction";
import angular from "angular";

export default class ScheduleIndexController {
	public readonly tableActions: OgTableActions;

	// Today's date (for checking if a schedule is overdue)
	public readonly today: Date = startOfDay(new Date());

	private readonly showError: (message?: string) => void;

	public constructor($scope: angular.IScope,
						$transitions: angular.ui.IStateParamsService,
						private readonly $uibModal: angular.ui.bootstrap.IModalService,
						private readonly $timeout: angular.ITimeoutService,
						private readonly $state: angular.ui.IStateService,
						private readonly transactionModel: TransactionModel,
						private readonly ogTableNavigableService: OgTableNavigableService,
						ogModalErrorService: OgModalErrorService,
						public readonly schedules: ScheduledTransaction[]) {
		const self: this = this;

		this.tableActions = {
			selectAction(index: number): void {
				self.editSchedule(index);
			},
			editAction(index: number): void {
				self.editSchedule(index);
			},
			insertAction(): void {
				self.editSchedule();
			},
			deleteAction(index: number): void {
				self.deleteSchedule(index);
			},
			focusAction(index: number): void {
				$state.go(`${$state.includes("**.schedule") ? "^" : ""}.schedule`, { id: self.schedules[index].id }).catch(self.showError);
			}
		};

		this.showError = ogModalErrorService.showError.bind(ogModalErrorService);

		// If we have a schedule id, focus the specified row
		if (!isNaN(Number($state.params.id))) {
			this.focusSchedule(Number($state.params.id));
		}

		// When the id state parameter changes, focus the specified row
		$scope.$on("$destroy", $transitions.onSuccess({ to: "root.schedules.schedule" }, (transition: angular.ui.IState): number => this.focusSchedule(Number(transition.params("to").id))));
	}

	// Shows/hides subtransactions
	public toggleSubtransactions($event: Event, schedule: SplitTransaction): void {
		// Toggle the show flag
		schedule.showSubtransactions = !schedule.showSubtransactions;

		// If we're showing
		if (schedule.showSubtransactions) {
			// Show the loading indicator
			schedule.loadingSubtransactions = true;

			// Clear the array?
			schedule.subtransactions = [];

			// Resolve the subtransactions
			this.transactionModel.findSubtransactions(Number(schedule.id)).then((subtransactions: SplitTransactionChild[]): void => {
				schedule.subtransactions = subtransactions;

				// Hide the loading indicator
				schedule.loadingSubtransactions = false;
			}).catch(this.showError);
		}

		$event.cancelBubble = true;
	}

	private editSchedule(index?: number): void {
		// Helper function to sort by next due date, then by transaction id
		function byNextDueDateAndId(a: ScheduledTransaction, b: ScheduledTransaction): number {
			let x: number | Date | string, y: number | Date | string;

			if (isEqual(a.next_due_date as Date, b.next_due_date as Date)) {
				x = Number(a.id);
				y = Number(b.id);
			} else {
				x = a.next_due_date;
				y = b.next_due_date;
			}

			return x < y ? -1 : x > y ? 1 : 0;
		}

		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: ScheduleEditView,
			controller: "ScheduleEditController",
			controllerAs: "vm",
			backdrop: "static",
			size: "lg",
			resolve: {
				schedule: (): angular.IPromise<ScheduledTransaction> | ScheduledTransaction | undefined => {
					// If we didn't get an index, we're adding a new schedule so just return null
					if (isNaN(Number(index))) {
						return undefined;
					}

					// If the selected schedule is a Split/Loan Repayment/Payslip; fetch the subtransactions first
					switch (this.schedules[Number(index)].transaction_type) {
						case "Split":
						case "LoanRepayment":
						case "Payslip":
							(this.schedules[Number(index)] as SplitTransaction).subtransactions = [];

							return this.transactionModel.findSubtransactions(Number(this.schedules[Number(index)].id)).then((subtransactions: SplitTransactionChild[]): ScheduledTransaction => {
								(this.schedules[Number(index)] as SplitTransaction).subtransactions = subtransactions;

								return this.schedules[Number(index)];
							});
						default:
							return this.schedules[Number(index)];
					}
				}
			}
		}).result
			.then((schedule: {data: ScheduledTransaction; skipped: boolean;}): void => {
				if (isNaN(Number(index))) {
					// Add new schedule to the end of the array
					this.schedules.push(schedule.data);
				} else {
					// Update the existing schedule in the array
					this.schedules[Number(index)] = schedule.data;
				}

				// Resort the array
				this.schedules.sort(byNextDueDateAndId);

				/*
				 * If we entered or skipped a transaction, refocus the schedule now at the original index,
				 * otherwise refocus the schedule that was edited
				 */
				this.focusSchedule(Number(schedule.skipped ? this.schedules[Number(index)].id : schedule.data.id));
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	private deleteSchedule(index: number): void {
		// Disable navigation on the table
		this.ogTableNavigableService.enabled = false;

		// Show the modal
		this.$uibModal.open({
			templateUrl: ScheduleDeleteView,
			controller: "ScheduleDeleteController",
			controllerAs: "vm",
			backdrop: "static",
			resolve: {
				schedule: (): ScheduledTransaction => this.schedules[index]
			}
		}).result
			.then((): void => {
				this.schedules.splice(index, 1);
				this.$state.go("root.schedules").catch(this.showError);
			})
			.finally((): true => (this.ogTableNavigableService.enabled = true))
			.catch(this.showError);
	}

	// Finds a specific schedule and focusses that row in the table
	private focusSchedule(scheduleIdToFocus: number): number {
		const delay = 50;
		let targetIndex = NaN;

		// Find the schedule by it's id
		angular.forEach(this.schedules, (schedule: ScheduledTransaction, index: number): void => {
			if (isNaN(targetIndex) && schedule.id === scheduleIdToFocus) {
				targetIndex = index;
			}
		});

		// If found, focus the row
		if (!isNaN(targetIndex)) {
			this.$timeout((): void => (this.tableActions as OgTableActionHandlers).focusRow(targetIndex), delay).catch(this.showError);
		}

		return targetIndex;
	}
}

ScheduleIndexController.$inject = ["$scope", "$transitions", "$uibModal", "$timeout", "$state", "transactionModel", "ogTableNavigableService", "ogModalErrorService", "schedules"];