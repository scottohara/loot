(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedules")
		.controller("ScheduleDeleteController", Controller);

	/**
	 * Dependencies
	 */
	Controller.$inject = ["$modalInstance", "scheduleModel", "schedule"];

	/**
	 * Implementation
	 */
	function Controller($modalInstance, scheduleModel, schedule) {
		var vm = this;

		/**
		 * Interface
		 */
		vm.schedule = schedule;
		vm.deleteSchedule = deleteSchedule;
		vm.cancel = cancel;
		vm.errorMessage = null;

		/**
		 * Implementation
		 */

		// Delete and close the modal
		function deleteSchedule() {
			vm.errorMessage = null;
			scheduleModel.destroy(vm.schedule).then(function() {
				$modalInstance.close();
			}, function(error) {
				vm.errorMessage = error.data;
			});
		}

		// Dismiss the modal without deleting
		function cancel() {
			$modalInstance.dismiss();
		}
	}
})();
