(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securities");

	// Declare the Security Edit controller
	mod.controller("securityEditController", ["$scope", "$modalInstance", "securityModel", "security",
		function($scope, $modalInstance, securityModel, security) {
			// Make the passed security available on the scope
			$scope.security = angular.extend({
			}, security);

			$scope.mode = (security ? "Edit" : "Add");

			// Give the name field initial focus
			$("#name").focus();

			// Save and close the modal
			$scope.save = function() {
				$scope.errorMessage = null;
				securityModel.save($scope.security).then(function(security) {
					$modalInstance.close(security.data);
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
