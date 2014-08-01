(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the Confirm controller
	mod.controller("ogModalConfirmController", ["$scope", "$modalInstance", "confirm",
		function($scope, $modalInstance, confirm) {
			// Make the passed confirmation details available on the scope
			$scope.confirm = angular.extend({
				noButtonStyle: "default",
				yesButtonStyle: "primary"
			}, confirm);

			// Yes response
			$scope.yes = function() {
				// Close the modal and return true
				$modalInstance.close(true);
			};

			// No response
			$scope.no = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
