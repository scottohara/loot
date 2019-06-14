import {IModalInstanceService} from "angular-ui-bootstrap";
import ScheduleModel from "schedules/models/schedule";
import {ScheduledTransaction} from "schedules/types";

export default class ScheduleDeleteController {
	public errorMessage: string | null = null;

	public constructor(private readonly $uibModalInstance: IModalInstanceService,
						private readonly scheduleModel: ScheduleModel,
						public readonly schedule: ScheduledTransaction) {}

	// Delete and close the modal
	public deleteSchedule(): void {
		this.errorMessage = null;
		this.scheduleModel.destroy(this.schedule).then((): void => this.$uibModalInstance.close(), (error: angular.IHttpResponse<string>): string => (this.errorMessage = error.data));
	}

	// Dismiss the modal without deleting
	public cancel(): void {
		this.$uibModalInstance.dismiss();
	}
}

ScheduleDeleteController.$inject = ["$uibModalInstance", "scheduleModel", "schedule"];