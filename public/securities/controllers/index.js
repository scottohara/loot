(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securities");

	// Declare the Security Index controller
	mod.controller("securityIndexController", ["$scope", "$modal", "$timeout", "$state", "securityModel", "ogTableNavigableService", "securities",
		function($scope, $modal, $timeout, $state, securityModel, ogTableNavigableService, securities) {
			// Store the securities on the scope
			$scope.securities = securities;

			// Calculate the total value
			$scope.totalValue = securities.reduce(function(totalValue, security) {
				return totalValue + Number(Number(security.closing_balance).toFixed(2));
			}, 0);

			$scope.editSecurity = function(index) {
				// Disable navigation on the table
				ogTableNavigableService.enabled = false;

				// Show the modal
				$modal.open({
					templateUrl: "securities/views/edit.html",
					controller: "securityEditController",
					backdrop: "static",
					resolve: {
						security: function() {
							var security;

							// If we didn't get an index, we're adding a new security so just return null
							if (!isNaN(index)) {
								security = $scope.securities[index];

								// Add the security to the LRU cache
								securityModel.addRecent(security);
							}

							return security;
						}
					}
				}).result.then(function(security) {
					if (isNaN(index)) {
						// Add new security to the end of the array
						$scope.securities.push(security);

						// Add the security to the LRU cache
						securityModel.addRecent(security);
					} else {
						// Update the existing security in the array
						$scope.securities[index] = security;
					}

					// Resort the array
					$scope.securities.sort(byHoldingAndName);

					// Refocus the security
					$scope.focusSecurity(security.id);
				}).finally(function() {
					// Enable navigation on the table
					ogTableNavigableService.enabled = true;
				});
			};

			$scope.deleteSecurity = function(index) {
				// Check if the security can be deleted
				securityModel.find($scope.securities[index].id).then(function(security) {
					// Disable navigation on the table
					ogTableNavigableService.enabled = false;

					var modalOptions = {
						backdrop: "static"
					};

					// Check if the security has any transactions
					if (security.num_transactions > 0) {
						// Show an alert modal
						modalOptions = angular.extend({
							templateUrl: "og-components/og-modal-alert/views/alert.html",
							controller: "ogModalAlertController",
							resolve: {
								alert: function() {
									return {
										header: "Security has existing transactions",
										message: "You must first delete these transactions, or reassign to another security before attempting to delete this security."
									};
								}
							}
						}, modalOptions);
					} else {
						// Show the delete security modal
						modalOptions = angular.extend({
							templateUrl: "securities/views/delete.html",
							controller: "securityDeleteController",
							resolve: {
								security: function() {
									return $scope.securities[index];
								}
							}
						}, modalOptions);
					}

					// Show the modal
					$modal.open(modalOptions).result.then(function() {
						$scope.securities.splice(index, 1);
						$state.go("root.securities");
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
				editAction: $scope.editSecurity,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					$scope.editSecurity();
				},
				deleteAction: $scope.deleteSecurity,
				focusAction: function(index) {
					$state.go(($state.includes("**.security") ? "^" : "") + ".security", {
						id: $scope.securities[index].id
					});
				}
			};

			// Finds a specific security and focusses that row in the table
			$scope.focusSecurity = function(securityIdToFocus) {
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

				if (a.unused === b.unused) {
					if ((a.current_holding > 0) === (b.current_holding > 0)) {
						x = a.name;
						y = b.name;
					} else {
						x = (a.current_holding <= 0);
						y = (b.current_holding <= 0);
					}
				} else {
					x = a.unused;
					y = b.unused;
				}

				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			};

			// Listen for state change events, and when the security id changes, ensure the row is focussed
			$scope.stateChangeSuccessHandler = function(event, toState, toParams, fromState, fromParams) {
				if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
					$scope.focusSecurity(Number(toParams.id));
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
				$scope.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
			});
		}
	]);
})();
