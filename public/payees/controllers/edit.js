(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("payees");

	// Declare the Payee Edit controller
	mod.controller("payeeEditController", ["$scope", "$modalInstance", "payeeModel", "payee",
		function($scope, $modalInstance, payeeModel, payee) {
			// Make the passed payee available on the scope
			$scope.payee = angular.extend({
			}, payee);

			$scope.mode = (payee ? "Edit" : "Add");

			// Save and close the modal
			$scope.save = function() {
				$scope.errorMessage = null;
				payeeModel.save($scope.payee).then(function(payee) {
					$modalInstance.close(payee.data);
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without saving
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
