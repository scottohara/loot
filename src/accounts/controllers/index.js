(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAccounts")
		.controller("AccountIndexController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$scope", "$modal", "accountModel", "accounts"];

	/**
	 * Implementation
	 */
	function Controller($scope, $modal, accountModel, accounts) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.accounts = accounts;
		vm.editAccount = editAccount;
		vm.deleteAccount = deleteAccount;
		vm.keyHandler = keyHandler;
		vm.calculateAccountTypeTotal = calculateAccountTypeTotal;
		vm.calculateNetWorth = calculateNetWorth;
		vm.netWorth = calculateNetWorth();

		/**
		 * Implementation
		 */
		function editAccount(accountType, index) {
			// Show the modal
			$modal.open({
				templateUrl: "accounts/views/edit.html",
				controller: "AccountEditController",
				controllerAs: "vm",
				backdrop: "static",
				resolve: {
					account: function() {
						var account;

						// If we didn't get an index, we're adding a new account so just return null
						if (accountType && !isNaN(index)) {
							account = vm.accounts[accountType].accounts[index];

							// Add the account to the LRU cache
							accountModel.addRecent(account);
						}

						return account;
					}
				}
			}).result.then(function(account) {
				var currentAccountType = account.account_type.charAt(0).toUpperCase() + account.account_type.substring(1) + " accounts";

				if (!accountType || isNaN(index)) {
					// Add new account to the end of the array
					vm.accounts[currentAccountType].accounts.push(account);

					// Add the account to the LRU cache
					accountModel.addRecent(account);
				} else {
					// If the edited account type has changed, move the account
					if (currentAccountType !== accountType) {
						// Remove the account from the original array
						vm.accounts[accountType].accounts.splice(index, 1);

						// Recalculate the array total
						vm.calculateAccountTypeTotal(accountType);

						// Add the account to the end of the new array
						vm.accounts[currentAccountType].accounts.push(account);
					} else {
						// Update the existing account in the array
						vm.accounts[accountType].accounts[index] = account;
					}
				}

				// Resort the array
				vm.accounts[currentAccountType].accounts.sort(byName);

				// Recalculate the array total
				vm.calculateAccountTypeTotal(currentAccountType);
	
				// Recalculate the net worth
				vm.netWorth = vm.calculateNetWorth();
			});
		}

		// Helper function to sort by payee name
		function byName(a, b) {
			var x, y;

			x = a.name;
			y = b.name;

			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		function deleteAccount(accountType, index) {
			// Check if the account can be deleted
			accountModel.find(vm.accounts[accountType].accounts[index].id).then(function(account) {
				var modalOptions = {
					backdrop: "static"
				};

				// Check if the account has any transactions
				if (account.num_transactions > 0) {
					// Show an alert modal
					modalOptions = angular.extend({
						templateUrl: "og-components/og-modal-alert/views/alert.html",
						controller: "OgModalAlertController",
						controllerAs: "vm",
						resolve: {
							alert: function() {
								return {
									header: "Account has existing transactions",
									message: "You must first delete these transactions, or reassign to another account before attempting to delete this account."
								};
							}
						}
					}, modalOptions);
				} else {
					// Show the delete account modal
					modalOptions = angular.extend({
						templateUrl: "accounts/views/delete.html",
						controller: "AccountDeleteController",
						controllerAs: "vm",
						resolve: {
							account: function() {
								return vm.accounts[accountType].accounts[index];
							}
						}
					}, modalOptions);
				}

				// Show the modal
				$modal.open(modalOptions).result.then(function() {
					vm.accounts[accountType].accounts.splice(index, 1);

					// Recalculate the array total
					vm.calculateAccountTypeTotal(accountType);
	
					// Recalculate the net worth
					vm.netWorth = vm.calculateNetWorth();
				});
			});
		}

		var INSERT_KEY = 45,
				N_KEY = 78;

		// Declare key handler for inserting a new account
		function keyHandler(event) {
			// Check if the Insert key or CTRL+N keys were pressed
			if (INSERT_KEY === event.keyCode || (event.ctrlKey && N_KEY === event.keyCode)) {
				vm.editAccount();
				event.preventDefault();
			}
		}

		function keydownHandler(event) {
			vm.keyHandler(event);
		}

		// Handler is wrapped in a function to aid with unit testing
		$(document).on("keydown", keydownHandler);

		// When the controller scope is destroyed, remove they keydown event handler
		$scope.$on("$destroy", function() {
			$(document).off("keydown", keydownHandler);
		});

		function calculateAccountTypeTotal(accountType) {
			vm.accounts[accountType].total = vm.accounts[accountType].accounts.reduce(function(memo, account) {
				return memo + account.closing_balance;
			}, 0);
		}

		function calculateNetWorth() {
			return Object.keys(vm.accounts).reduce(function(memo, accountType) {
				return memo + vm.accounts[accountType].total;
			}, 0);
		}
	}
})();
