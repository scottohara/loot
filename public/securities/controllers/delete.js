(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security Delete controller
	mod.controller('securityDeleteController', ['$scope', '$modalInstance', 'securityModel', 'security',
		function($scope, $modalInstance, securityModel, security) {
			// Make the passed security available on the scope
			$scope.security = security;

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				securityModel.destroy($scope.security).then(function() {
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
