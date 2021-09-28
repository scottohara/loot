import type { ControllerTestFactory } from "mocks/types";
import type MockDependenciesProvider from "mocks/loot/mockdependencies";
import type ScheduleDeleteController from "schedules/controllers/delete";
import type { ScheduleModelMock } from "mocks/schedules/types";
import type { ScheduledTransaction } from "schedules/types";
import type { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("ScheduleDeleteController", (): void => {
	let	scheduleDeleteController: ScheduleDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			scheduleModel: ScheduleModelMock,
			schedule: ScheduledTransaction;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "scheduleModel", "schedule"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _scheduleModel_: ScheduleModelMock, _schedule_: ScheduledTransaction): void => {
		$uibModalInstance = _$uibModalInstance_;
		scheduleModel = _scheduleModel_;
		schedule = _schedule_;
		scheduleDeleteController = controllerTest("ScheduleDeleteController") as ScheduleDeleteController;
	}) as Mocha.HookFunction);

	it("should make the passed schedule available to the view", (): Chai.Assertion => scheduleDeleteController.schedule.should.deep.equal(schedule));

	describe("deleteSchedule", (): void => {
		it("should reset any previous error messages", (): void => {
			scheduleDeleteController.errorMessage = "error message";
			scheduleDeleteController.deleteSchedule();
			(null === scheduleDeleteController.errorMessage as string | null).should.be.true;
		});

		it("should delete the schedule", (): void => {
			scheduleDeleteController.deleteSchedule();
			scheduleModel.destroy.should.have.been.calledWith(schedule);
		});

		it("should close the modal when the schedule delete is successful", (): void => {
			scheduleDeleteController.deleteSchedule();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the schedule delete is unsuccessful", (): void => {
			scheduleDeleteController.schedule.id = -1;
			scheduleDeleteController.deleteSchedule();
			(scheduleDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			scheduleDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
