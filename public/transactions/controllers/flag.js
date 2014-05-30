(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('transactions');

	// Declare the Transaction Flag controller
	mod.controller('transactionFlagController', ['$scope', '$modalInstance', 'transactionModel', 'contextModel', 'context', 'transaction',
		function($scope, $modalInstance, transactionModel, contextModel, context, transaction) {
			// Make the passed transaction available on the scope
			$scope.transaction = transaction;

			// Make the transaction's flag memo available on the scope
			$scope.flag = {
				memo: transaction.flag
			};
			$scope.flagged = !!transaction.flag;

			// Save and close the modal
			$scope.save = function() {
				$scope.errorMessage = null;
				$scope.transaction.flag = $scope.flag.memo;
				transactionModel.flag(contextModel.path(context.id), $scope.transaction).then(function() {
					$modalInstance.close($scope.transaction);
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				transactionModel.unflag(contextModel.path(context.id), $scope.transaction.id).then(function() {
					$scope.transaction.flag = null;
					$modalInstance.close($scope.transaction);
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
