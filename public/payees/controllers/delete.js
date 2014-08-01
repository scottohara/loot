(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payees");

	// Declare the Payee Delete controller
	mod.controller("payeeDeleteController", ["$scope", "$modalInstance", "payeeModel", "payee",
		function($scope, $modalInstance, payeeModel, payee) {
			// Make the passed payee available on the scope
			$scope.payee = payee;

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				payeeModel.destroy($scope.payee).then(function() {
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
