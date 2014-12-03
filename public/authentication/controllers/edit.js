(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("authentication");

	// Declare the Authentication Edit controller
	mod.controller("authenticationEditController", ["$scope", "$modalInstance", "authenticationModel",
		function($scope, $modalInstance, authenticationModel) {
			$scope.authentication = {};

			// Login and close the modal
			$scope.login = function() {
				$scope.errorMessage = null;
				authenticationModel.login($scope.authentication.userName, $scope.authentication.password).then(function() {
					$modalInstance.close();
				}, function(error) {
					$scope.errorMessage = error.data;
				});
			};

			// Dismiss the modal without logging in
			$scope.cancel = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
