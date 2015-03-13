(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSecurities")
		.controller("SecurityIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "$timeout", "$state", "securityModel", "ogTableNavigableService", "securities"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, $timeout, $state, securityModel, ogTableNavigableService, securities) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.securities = securities;
		vm.totalValue = securities.reduce(totalValue, 0);
		vm.editSecurity = editSecurity;
		vm.focusSecurity = focusSecurity;
		vm.deleteSecurity = deleteSecurity;
		vm.tableActions = tableActions();
		vm.stateChangeSuccessHandler = stateChangeSuccessHandler;

		/**
		 * Implementation
		 */
		// Calculate the total value
		function totalValue(memo, security) {
			return memo + Number(Number(security.closing_balance).toFixed(2));
		}

		function editSecurity(index) {
			// Disable navigation on the table
			ogTableNavigableService.enabled = false;

			// Show the modal
			$modal.open({
				templateUrl: "securities/views/edit.html",
				controller: "SecurityEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					security: function() {
						var security;

						// If we didn't get an index, we're adding a new security so just return null
						if (!isNaN(index)) {
							security = vm.securities[index];

							// Add the security to the LRU cache
							securityModel.addRecent(security);
						}

						return security;
					}
				}
			}).result.then(function(security) {
				if (isNaN(index)) {
					// Add new security to the end of the array
					vm.securities.push(security);

					// Add the security to the LRU cache
					securityModel.addRecent(security);
				} else {
					// Update the existing security in the array
					vm.securities[index] = security;
				}

				// Resort the array
				vm.securities.sort(byHoldingAndName);

				// Refocus the security
				vm.focusSecurity(security.id);
			}).finally(function() {
				// Enable navigation on the table
				ogTableNavigableService.enabled = true;
			});
		}

		function deleteSecurity(index) {
			// Check if the security can be deleted
			securityModel.find(vm.securities[index].id).then(function(security) {
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
						controller: "OgModalAlertController",
						controllerAs: "vm",
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
						controller: "SecurityDeleteController",
						controllerAs: "vm",
						resolve: {
							security: function() {
								return vm.securities[index];
							}
						}
					}, modalOptions);
				}

				// Show the modal
				$modal.open(modalOptions).result.then(function() {
					vm.securities.splice(index, 1);
					$state.go("root.securities");
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
				editAction: vm.editSecurity,
				insertAction: function() {
					// Same as select action, but don't pass any arguments
					vm.editSecurity();
				},
				deleteAction: vm.deleteSecurity,
				focusAction: function(index) {
					$state.go(($state.includes("**.security") ? "^" : "") + ".security", {
						id: vm.securities[index].id
					});
				}
			};
		}

		// Finds a specific security and focusses that row in the table
		function focusSecurity(securityIdToFocus) {
			var targetIndex;

			// Find the security by it's id
			angular.forEach(vm.securities, function(security, index) {
				if (isNaN(targetIndex) && security.id === securityIdToFocus) {
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

		// Helper function to sort by security current holding and name
		function byHoldingAndName(a, b) {
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
		}

		// Listen for state change events, and when the security id changes, ensure the row is focussed
		function stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				vm.focusSecurity(Number(toParams.id));
			}
		}

		// Handler is wrapped in a function to aid with unit testing
		$scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
			vm.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams);
		});
	}
})();
