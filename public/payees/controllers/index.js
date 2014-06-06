(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('payees');

	// Declare the Payee Index controller
	mod.controller('payeeIndexController', ['$scope', '$modal', '$timeout', '$state', 'payeeModel', 'payees',
		function($scope, $modal, $timeout, $state, payeeModel, payees) {
			// Store the payees on the scope
			$scope.payees = payees;

			$scope.editPayee = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'payees/views/edit.html',
					controller: 'payeeEditController',
					backdrop: 'static',
					resolve: {
						payee: function() {
							// If we didn't get an index, we're adding a new payee so just return null
							if (isNaN(index)) {
								return null;
							}

							return $scope.payees[index];
						}
					}
				}).result.then(function(payee) {
					if (isNaN(index)) {
						// Add new payee to the end of the array
						$scope.payees.push(payee);
					} else {
						// Update the existing payee in the array
						$scope.payees[index] = payee;
					}

					// Resort the array
					$scope.payees.sort(byName);

					// Refocus the payee
					focusPayee(payee.id);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deletePayee = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'payees/views/delete.html',
					controller: 'payeeDeleteController',
					backdrop: 'static',
					resolve: {
						payee: function() {
							return $scope.payees[index];
						}
					}
				}).result.then(function() {
					$scope.payees.splice(index, 1);
					$state.go('root.payees');
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			// Action handlers for navigable table
			$scope.tableActions = {
				navigationEnabled: function() {
					return !($scope.navigationDisabled || $scope.navigationGloballyDisabled);
				},
				selectAction: function() {
					$state.go('.transactions');
				},
				editAction: $scope.editPayee,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editPayee();
				},
				deleteAction: deletePayee,
				focusAction: function(index) {
					$state.go(($state.includes('**.payee') ? '^' : '') + '.payee', {
						id: $scope.payees[index].id
					});
				}
			};

			// Finds a specific payee and focusses that row in the table
			var focusPayee = function(payeeIdToFocus) {
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
			$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
				if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
					focusPayee(Number(toParams.id));
				}
			});
		}
	]);
})();
