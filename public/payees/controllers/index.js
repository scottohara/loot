(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("payees")
		.controller("PayeeIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "$timeout", "$state", "payeeModel", "ogTableNavigableService", "payees"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, $timeout, $state, payeeModel, ogTableNavigableService, payees) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.payees = payees;
		vm.editPayee = editPayee;
		vm.focusPayee = focusPayee;
		vm.deletePayee = deletePayee;
		vm.tableActions = tableActions();
		vm.stateChangeSuccessHandler = stateChangeSuccessHandler;

		/**
		 * Implementation
		 */
		function editPayee(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "payees/views/edit.html",
				controller: "PayeeEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					payee: function() {
						var payee;

						// If we didn't get an index, we're adding a new payee so just return null
						if (!isNaN(index)) {
							payee = vm.payees[index];

							// Add the payee to the LRU cache
							payeeModel.addRecent(payee);
						}

						return payee;
					}
				}
			}).result.then(function(payee) {
				if (isNaN(index)) {
					// Add new payee to the end of the array
					vm.payees.push(payee);

					// Add the payee to the LRU cache
					payeeModel.addRecent(payee);
				} else {
					// Update the existing payee in the array
					vm.payees[index] = payee;
				}

				// Resort the array
				vm.payees.sort(byName);

				// Refocus the payee
				vm.focusPayee(payee.id);
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		function deletePayee(index) {
			// Check if the payee can be deleted
			payeeModel.find(vm.payees[index].id).then(function(payee) {
				// Disable navigation on the table
				ogTableNavigableService.enabled = false;

				var modalOptions = {
					backdrop: "static"
				};

				// Check if the payee has any transactions
				if (payee.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend({
						templateUrl: "og-components/og-modal-alert/views/alert.html",
						controller: "OgModalAlertController",
						controllerAs: "vm",
						resolve: {
							alert: function() {
								return {
									header: "Payee has existing transactions",
									message: "You must first delete these transactions, or reassign to another payee before attempting to delete this payee."
								};
							}
						}
					}, modalOptions);
				} else {
					// Show the delete payee modal
					modalOptions = angular.extend({
						templateUrl: "payees/views/delete.html",
						controller: "PayeeDeleteController",
						controllerAs: "vm",
						resolve: {
							payee: function() {
								return vm.payees[index];
							}
						}
					}, modalOptions);
				}

				// Show the modal
				$modal.open(modalOptions).result.then(function() {
					vm.payees.splice(index, 1);
					$state.go("root.payees");
				}).finally(function() {
					// Enable navigation on the table
					ogTableNavigableService.enabled = true;
				});
			});
		}

		// Action handlers for navigable table
		function tableActions() {
			return {
				selectAction: function() {
					$state.go(".transactions");
				},
				editAction: vm.editPayee,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					vm.editPayee();
				},
				deleteAction: vm.deletePayee,
				focusAction: function(index) {
					$state.go(($state.includes("**.payee") ? "^" : "") + ".payee", {
						id: vm.payees[index].id
					});
				}
			};
		}

		// Finds a specific payee and focusses that row in the table
		function focusPayee(payeeIdToFocus) {
			var targetIndex;

			// Find the payee by it's id
			angular.forEach(vm.payees, function(payee, index) {
				if (isNaN(targetIndex) && payee.id === payeeIdToFocus) {
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

		// Helper function to sort by payee name
		function byName(a, b) {
			var x, y;

			x = a.name;
			y = b.name;

			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		// Listen for state change events, and when the payee id changes, ensure the row is focussed
		function stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				vm.focusPayee(Number(toParams.id));
			}
		}

		// Handler is wrapped in a function to aid with unit testing
		$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			vm.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
		});
	}
})();
