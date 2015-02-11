(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payees");

	// Declare the Payee Index controller
	mod.controller("payeeIndexController", ["$scope", "$modal", "$timeout", "$state", "payeeModel", "ogTableNavigableService", "payees",
		function($scope, $modal, $timeout, $state, payeeModel, ogTableNavigableService, payees) {
			// Store the payees on the scope
			$scope.payees = payees;

			$scope.editPayee = function(index) {
				// Disable navigation on the table
				ogTableNavigableService.enabled = false;

				// Show the modal
				$modal.open({
					templateUrl: "payees/views/edit.html",
					controller: "payeeEditController",
					backdrop: "static",
					resolve: {
						payee: function() {
							var payee;

							// If we didn't get an index, we're adding a new payee so just return null
							if (!isNaN(index)) {
								payee = $scope.payees[index];

								// Add the payee to the LRU cache
								payeeModel.addRecent(payee);
							}

							return payee;
						}
					}
				}).result.then(function(payee) {
					if (isNaN(index)) {
						// Add new payee to the end of the array
						$scope.payees.push(payee);

						// Add the payee to the LRU cache
						payeeModel.addRecent(payee);
					} else {
						// Update the existing payee in the array
						$scope.payees[index] = payee;
					}

					// Resort the array
					$scope.payees.sort(byName);

					// Refocus the payee
					$scope.focusPayee(payee.id);
				}).finally(function() {
					// Enable navigation on the table
					ogTableNavigableService.enabled = true;
				});
			};

			$scope.deletePayee = function(index) {
				// Check if the payee can be deleted
				payeeModel.find($scope.payees[index].id).then(function(payee) {
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
							controller: "ogModalAlertController",
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
							controller: "payeeDeleteController",
							resolve: {
								payee: function() {
									return $scope.payees[index];
								}
							}
						}, modalOptions);
					}

					// Show the modal
					$modal.open(modalOptions).result.then(function() {
						$scope.payees.splice(index, 1);
						$state.go("root.payees");
					}).finally(function() {
						// Enable navigation on the table
						ogTableNavigableService.enabled = true;
					});
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				selectAction: function() {
					$state.go(".transactions");
				},
				editAction: $scope.editPayee,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editPayee();
				},
				deleteAction: $scope.deletePayee,
				focusAction: function(index) {
					$state.go(($state.includes("**.payee") ? "^" : "") + ".payee", {
						id: $scope.payees[index].id
					});
				}
			};

			// Finds a specific payee and focusses that row in the table
			$scope.focusPayee = function(payeeIdToFocus) {
				var targetIndex;

				// Find the payee by it's id
				angular.forEach($scope.payees, function(payee, index) {
					if (isNaN(targetIndex) && payee.id === payeeIdToFocus) {
						targetIndex = index;
					}
				});

				// If found, focus the row
				if (!isNaN(targetIndex)) {
					$timeout(function() {
						$scope.tableActions.focusRow(targetIndex);
					}, 50);
				}

				return targetIndex;
			};

			// Helper function to sort by payee name
			var byName = function(a, b) {
				var x, y;

				x = a.name;
				y = b.name;

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Listen for state change events, and when the payee id changes, ensure the row is focussed
			$scope.stateChangeSuccessHandler = function(event, toState, toParams, fromState, fromParams) {
				if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
					$scope.focusPayee(Number(toParams.id));
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
				$scope.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
			});
		}
	]);
})();
