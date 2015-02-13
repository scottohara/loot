(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("schedules")
		.controller("ScheduleIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "$timeout", "$state", "scheduleModel", "transactionModel", "ogTableNavigableService", "schedules"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, $timeout, $state, scheduleModel, transactionModel, ogTableNavigableService, schedules) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.schedules = schedules;
		vm.editSchedule = editSchedule;
		vm.focusSchedule = focusSchedule;
		vm.deleteSchedule = deleteSchedule;
		vm.tableActions = tableActions();
		vm.today = moment().startOf("day").toDate();	// Today's date (for checking if a schedule is overdue
		vm.toggleSubtransactions = toggleSubtransactions;
		vm.stateChangeSuccessHandler = stateChangeSuccessHandler;

		/**
		 * Implementation
		 */
		function editSchedule(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "schedules/views/edit.html",
				controller: "ScheduleEditController",
				controllerAs: "vm",
				backdrop: "static",
				size: "lg",
				resolve: {
					schedule: function() {
						// If we didn't get an index, we're adding a new schedule so just return null
						if (isNaN(index)) {
							return null;
						}

						// If the selected schedule is a Split/Loan Repayment/Payslip; fetch the subtransactions first
						switch (vm.schedules[index].transaction_type) {
							case "Split":
							case "LoanRepayment":
							case "Payslip":
								vm.schedules[index].subtransactions = [];
								return transactionModel.findSubtransactions(vm.schedules[index].id).then(function(subtransactions) {
									vm.schedules[index].subtransactions = subtransactions;
									return vm.schedules[index];
								});
							default:
								return vm.schedules[index];
						}
					}
				}
			}).result.then(function(schedule) {
				if (isNaN(index)) {
					// Add new schedule to the end of the array
					vm.schedules.push(schedule.data);
				} else {
					// Update the existing schedule in the array
					vm.schedules[index] = schedule.data;
				}

				// Resort the array
				vm.schedules.sort(byNextDueDateAndId);

				// If we entered or skipped a transaction, refocus the schedule now at the original index,
				// otherwise refocus the schedule that was edited
				vm.focusSchedule(schedule.skipped ? vm.schedules[index].id : schedule.data.id);
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		function deleteSchedule(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "schedules/views/delete.html",
				controller: "ScheduleDeleteController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					schedule: function() {
						return vm.schedules[index];
					}
				}
			}).result.then(function() {
				vm.schedules.splice(index, 1);
				$state.go("root.schedules");
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		// Action handlers for navigable table
		function tableActions() {
			return {
				selectAction: vm.editSchedule,
				editAction: vm.editSchedule,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					vm.editSchedule();
				},
				deleteAction: vm.deleteSchedule,
				focusAction: function(index) {
					$state.go(($state.includes("**.schedule") ? "^" : "") + ".schedule", {
						id: vm.schedules[index].id
					});
				}
			};
		}

		// Finds a specific schedule and focusses that row in the table
		function focusSchedule(scheduleIdToFocus) {
			var targetIndex;

			// Find the schedule by it's id
			angular.forEach(vm.schedules, function(schedule, index) {
				if (isNaN(targetIndex) && schedule.id === scheduleIdToFocus) {
					targetIndex = index;
				}
			});

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				$timeout(function() {
					vm.tableActions.focusRow(targetIndex);
				}, 50);
			}

			return targetIndex;
		}

		// Helper function to sort by next due date, then by transaction id
		function byNextDueDateAndId(a, b) {
			var x, y;

			if (moment(a.next_due_date).isSame(b.next_due_date)) {
				x = a.id;
				y = b.id;
			} else {
				x = a.next_due_date;
				y = b.next_due_date;
			}

			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		// Shows/hides subtransactions
		function toggleSubtransactions($event, schedule) {
			// Toggle the show flag
			schedule.showSubtransactions = !schedule.showSubtransactions;

			// If we're showing
			if (schedule.showSubtransactions) {
				// Show the loading indicator
				schedule.loadingSubtransactions = true;

				// Clear the array?
				schedule.subtransactions = [];

				// Resolve the subtransactions
				transactionModel.findSubtransactions(schedule.id).then(function(subtransactions) {
					schedule.subtransactions = subtransactions;

					// Hide the loading indicator
					schedule.loadingSubtransactions = false;
				});
			}

			$event.cancelBubble = true;
		}

		// Listen for state change events, and when the schedule id changes, ensure the row is focussed
		function stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				vm.focusSchedule(Number(toParams.id));
			}
		}

		// Handler is wrapped in a function to aid with unit testing
		$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			vm.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
		});
	}
})();
