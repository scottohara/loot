(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('schedules');

	// Declare the Schedule Delete controller
	mod.controller('scheduleDeleteController', ['$scope', '$modalInstance', 'scheduleModel', 'schedule',
		function($scope, $modalInstance, scheduleModel, schedule) {
			// Make the passed schedule available on the scope
			$scope.schedule = schedule;

			// Delete and close the modal
			$scope.delete = function() {
				$scope.errorMessage = null;
				scheduleModel.destroy($scope.schedule).then(function() {
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
