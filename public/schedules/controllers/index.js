(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('schedules');

	// Declare the Schedule Index controller
	mod.controller('scheduleIndexController', ['$scope', '$modal', '$timeout', 'scheduleModel', 'transactionModel',
		function($scope, $modal, $timeout, scheduleModel, transactionModel) {
			var editSchedule = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'schedules/views/edit.html',
					controller: 'scheduleEditController',
					backdrop: 'static',
					resolve: {
						schedule: function() {
							// If we didn't get an index, we're adding a new schedule so just return null
							if (isNaN(index)) {
								return null;
							}

							// If the selected schedule is a Split/Loan Repayment/Payslip; fetch the subtransactions first
							switch ($scope.schedules[index].transaction_type) {
								case "Split":
								case "LoanRepayment":
								case "Payslip":
									$scope.schedules[index].subtransactions = [];
									return transactionModel.findSubtransactions($scope.schedules[index].account.id, $scope.schedules[index].id).then(function(subtransactions) {
										$scope.schedules[index].subtransactions = subtransactions;
										return $scope.schedules[index];
									});
								default:
									return $scope.schedules[index];
							}
						}
					}
				}).result.then(function(schedule) {
					if (isNaN(index)) {
						// Add new schedule to the end of the array
						$scope.schedules.push(schedule);
					} else {
						// Update the existing schedule in the array
						$scope.schedules[index] = schedule;
					}

					// Resort the array
					$scope.schedules.sort(byNextDueDateAndId);

					// Refocus the schedule
					focusSchedule(schedule);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deleteSchedule = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'schedules/views/delete.html',
					controller: 'scheduleDeleteController',
					backdrop: 'static',
					resolve: {
						schedule: function() {
							return $scope.schedules[index];
						}
					}
				}).result.then(function() {
					$scope.schedules.splice(index, 1);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !$scope.navigationDisabled;
				},
				selectAction: editSchedule,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					editSchedule();
				},
				deleteAction: deleteSchedule
			};

			// Today's date (for checking if a schedule is overdue
			$scope.today = moment().format("YYYY-MM-DD");

			// Fetch the schedules
			scheduleModel.all().then(function(schedules) {
				$scope.schedules = schedules;
			});

			// Finds a specific schedule and focusses that row in the table
			var focusSchedule = function(scheduleToFocus) {
				var targetIndex;

				// Find the schedule by it's id
				angular.forEach($scope.schedules, function(schedule, index) {
					if (schedule.id === scheduleToFocus.id) {
						targetIndex = index;
					}
				});

				// Focus the row
				$timeout(function() {
					$scope.tableActions.focusRow(targetIndex);
				}, 50);
			};

			// Helper function to sort by next due date, then by transaction id
			var byNextDueDateAndId = function(a, b) {
				var x, y;

				if (a.next_due_date === b.next_due_date) {
					x = a.id;
					y = b.id;
				} else {
					x = a.next_due_date;
					y = b.next_due_date;
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Shows/hides subtransactions
			$scope.toggleSubtransactions = function($event, schedule) {
				// Toggle the show flag
				schedule.showSubtransactions = !schedule.showSubtransactions;

				// If we’re showing
				if (schedule.showSubtransactions) {
					// Show the loading indicator
					schedule.loadingSubtransactions = true;

					// Clear the array?
					schedule.subtransactions = [];

					// Resolve the subtransactions
					transactionModel.findSubtransactions(schedule.account.id, schedule.id).then(function(subtransactions) {
						schedule.subtransactions = subtransactions;

						// Hide the loading indicator
						schedule.loadingSubtransactions = false;
					});
				}

				$event.cancelBubble = true;
			};
		}
	]);
})();
