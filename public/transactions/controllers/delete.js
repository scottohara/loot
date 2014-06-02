(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction Delete controller
	mod.controller('transactionDeleteController', ['$scope', '$modalInstance', 'transactionModel', 'transaction',
		function($scope, $modalInstance, transactionModel, transaction) {
			// Make the passed transaction available on the scope
			$scope.transaction = transaction;

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				transactionModel.destroy($scope.transaction).then(function() {
					$modalInstance.close();
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without deleting
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
