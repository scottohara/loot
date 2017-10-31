export default class ScheduleDeleteController {
	constructor($uibModalInstance, scheduleModel, schedule) {
		this.$uibModalInstance = $uibModalInstance;
		this.scheduleModel = scheduleModel;
		this.schedule = schedule;
		this.errorMessage = null;
	}

	// Delete and close the modal
	deleteSchedule() {
		this.errorMessage = null;
		this.scheduleModel.destroy(this.schedule).then(() => this.$uibModalInstance.close(), error => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	cancel() {
		this.$uibModalInstance.dismiss();
	}
}

ScheduleDeleteController.$inject = ["$uibModalInstance", "scheduleModel", "schedule"];