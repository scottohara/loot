{
	/**
	 * Implementation
	 */
	class PayeeIndexController {
		constructor($scope, $uibModal, $timeout, $state, payeeModel, ogTableNavigableService, payees) {
			const self = this;

			this.$scope = $scope;
			this.$uibModal = $uibModal;
			this.$timeout = $timeout;
			this.$state = $state;
			this.payeeModel = payeeModel;
			this.ogTableNavigableService = ogTableNavigableService;
			this.payees = payees;
			this.tableActions = {
				selectAction() {
					$state.go(".transactions");
				},
				editAction(index) {
					self.editPayee(index);
				},
				insertAction() {
					self.editPayee();
				},
				deleteAction(index) {
					self.deletePayee(index);
				},
				focusAction(index) {
					$state.go(`${$state.includes("**.payee") ? "^" : ""}.payee`, {id: self.payees[index].id});
				}
			};

			// Handler is wrapped in a function to aid with unit testing
			this.$scope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => this.stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams));
		}

		editPayee(index) {
			// Helper function to sort by payee name
			function byName(a, b) {
				const x = a.name,
							y = b.name;

				return x < y ? -1 : x > y ? 1 : 0;
			}

			// Disable navigation on the table
			this.ogTableNavigableService.enabled = false;

			// Show the modal
			this.$uibModal.open({
				templateUrl: "payees/views/edit.html",
				controller: "PayeeEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					payee: () => {
						let payee;

						// If we didn't get an index, we're adding a new payee so just return null
						if (!isNaN(index)) {
							payee = this.payees[index];

							// Add the payee to the LRU cache
							this.payeeModel.addRecent(payee);
						}

						return payee;
					}
				}
			}).result.then(payee => {
				if (isNaN(index)) {
					// Add new payee to the end of the array
					this.payees.push(payee);

					// Add the payee to the LRU cache
					this.payeeModel.addRecent(payee);
				} else {
					// Update the existing payee in the array
					this.payees[index] = payee;
				}

				// Resort the array
				this.payees.sort(byName);

				// Refocus the payee
				this.focusPayee(payee.id);
			}).finally(() => this.ogTableNavigableService.enabled = true);
		}

		deletePayee(index) {
			// Check if the payee can be deleted
			this.payeeModel.find(this.payees[index].id).then(payee => {
				// Disable navigation on the table
				this.ogTableNavigableService.enabled = false;

				let modalOptions = {
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
							alert: () => ({
								header: "Payee has existing transactions",
								message: "You must first delete these transactions, or reassign to another payee before attempting to delete this payee."
							})
						}
					}, modalOptions);
				} else {
					// Show the delete payee modal
					modalOptions = angular.extend({
						templateUrl: "payees/views/delete.html",
						controller: "PayeeDeleteController",
						controllerAs: "vm",
						resolve: {
							payee: () => this.payees[index]
						}
					}, modalOptions);
				}

				// Show the modal
				this.$uibModal.open(modalOptions).result.then(() => {
					this.payees.splice(index, 1);
					this.$state.go("root.payees");
				}).finally(() => this.ogTableNavigableService.enabled = true);
			});
		}

		// Finds a specific payee and focusses that row in the table
		focusPayee(payeeIdToFocus) {
			const delay = 50;
			let targetIndex;

			// Find the payee by it's id
			angular.forEach(this.payees, (payee, index) => {
				if (isNaN(targetIndex) && payee.id === payeeIdToFocus) {
					targetIndex = index;
				}
			});

			// If found, focus the row
			if (!isNaN(targetIndex)) {
				this.$timeout(() => this.tableActions.focusRow(targetIndex), delay);
			}

			return targetIndex;
		}

		// Listen for state change events, and when the payee id changes, ensure the row is focussed
		stateChangeSuccessHandler(event, toState, toParams, fromState, fromParams) {
			if (toParams.id && (toState.name !== fromState.name || toParams.id !== fromParams.id)) {
				this.focusPayee(Number(toParams.id));
			}
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootPayees")
		.controller("PayeeIndexController", PayeeIndexController);

	/**
	 * Dependencies
	 */
	PayeeIndexController.$inject = ["$scope", "$uibModal", "$timeout", "$state", "payeeModel", "ogTableNavigableService", "payees"];
}
