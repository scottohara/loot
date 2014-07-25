(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the Alert controller
	mod.controller('ogModalAlertController', ['$scope', '$modalInstance', 'alert',
		function($scope, $modalInstance, alert) {
			// Make the passed alert details available on the scope
			$scope.alert = angular.extend({
				closeButtonStyle: 'primary'
			}, alert);

			// Close the modal
			$scope.close = function() {
				$modalInstance.dismiss();
			};
		}
	]);
})();
