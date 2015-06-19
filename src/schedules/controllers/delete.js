{
	/**
	 * Implementation
	 */
	class Controller {
		constructor($modalInstance, scheduleModel, schedule) {
			this.$modalInstance = $modalInstance;
			this.scheduleModel = scheduleModel;
			this.schedule = schedule;
			this.errorMessage = null;
		}

		// Delete and close the modal
		deleteSchedule() {
			this.errorMessage = null;
			this.scheduleModel.destroy(this.schedule).then(() => this.$modalInstance.close(), error => this.errorMessage = error.data);
		}

		// Dismiss the modal without deleting
		cancel() {
			this.$modalInstance.dismiss();
		}
	}

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
}
