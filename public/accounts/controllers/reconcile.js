(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("accounts");

	// Declare the Account Reconcile controller
	mod.controller("accountReconcileController", ["$scope", "$modalInstance", "$window", "account",
		function($scope, $modalInstance, $window, account) {
			var LOCAL_STORAGE_KEY = "lootClosingBalance-" + account.id;

			// Get the closing balance from local storage (if exists)
			$scope.account = {
				closingBalance: Number($window.localStorage.getItem(LOCAL_STORAGE_KEY))
			};

			// Save and close the modal
			$scope.start = function() {
				// Store the closing balance in local storage
				$window.localStorage.setItem(LOCAL_STORAGE_KEY, $scope.account.closingBalance);

				// Close the modal and return the balance
				$modalInstance.close($scope.account.closingBalance);
			};

			// Dismiss the modal without saving
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
