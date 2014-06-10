(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security Index controller
	mod.controller('securityIndexController', ['$scope', '$modal', '$timeout', '$state', 'securityModel', 'securities',
		function($scope, $modal, $timeout, $state, securityModel, securities) {
			// Store the securities on the scope
			$scope.securities = securities;

			// Calculate the total value
			$scope.totalValue = securities.reduce(function(totalValue, security) {
				return totalValue + Number(Number(security.current_value).toFixed(2));
			}, 0);

			$scope.editSecurity = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'securities/views/edit.html',
					controller: 'securityEditController',
					backdrop: 'static',
					resolve: {
						security: function() {
							// If we didn't get an index, we're adding a new security so just return null
							if (isNaN(index)) {
								return null;
							}

							return $scope.securities[index];
						}
					}
				}).result.then(function(security) {
					if (isNaN(index)) {
						// Add new security to the end of the array
						$scope.securities.push(security);
					} else {
						// Update the existing security in the array
						$scope.securities[index] = security;
					}

					// Resort the array
					$scope.security.sort(byHoldingAndName);

					// Refocus the security
					focusSecurity(security.id);
				}).finally(function() {
					// Enable navigation on the table
					$scope.navigationDisabled = false;
				});
			};

			var deleteSecurity = function(index) {
				// Disable navigation on the table
				$scope.navigationDisabled = true;

				// Show the modal
				$modal.open({
					templateUrl: 'securities/views/delete.html',
					controller: 'securityDeleteController',
					backdrop: 'static',
					resolve: {
						security: function() {
							return $scope.securities[index];
						}
					}
				}).result.then(function() {
					$scope.securities.splice(index, 1);
					$state.go('root.securities');
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
				editAction: $scope.editSecurity,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editSecurity();
				},
				deleteAction: deleteSecurity,
				focusAction: function(index) {
					$state.go(($state.includes('**.security') ? '^' : '') + '.security', {
						id: $scope.securities[index].id
					});
				}
			};

			// Finds a specific security and focusses that row in the table
			var focusSecurity = function(securityIdToFocus) {
				var targetIndex;

				// Find the security by it's id
				angular.forEach($scope.securities, function(security, index) {
					if (isNaN(targetIndex) && security.id === securityIdToFocus) {
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

			// Helper function to sort by security current holding and name
			var byHoldingAndName = function(a, b) {
				var x, y;

				if ((a.current_holding > 0) === (b.current_holding > 0)) {
					x = a.name;
					y = b.name;
				} else {
					x = (a.current_holding > 0);
					y = (b.current_holding > 0);
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Listen for state change events, and when the security id changes, ensure the row is focussed
			$scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
				if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
					focusSecurity(Number(toParams.id));
				}
			});
		}
	]);
})();
