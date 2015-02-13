(function() {
	"use strict";

	/*jshint expr: true */

	describe("ScheduleDeleteController", function() {
		// The object under test
		var scheduleDeleteController;

		// Dependencies
		var $modalInstance,
				scheduleModel,
				schedule;

		// Load the modules
		beforeEach(module("lootMocks", "schedules", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modalInstance", "scheduleModel", "schedule"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(controllerTest, _$modalInstance_, _scheduleModel_, _schedule_) {
			$modalInstance = _$modalInstance_;
			scheduleModel = _scheduleModel_;
			schedule = _schedule_;
			scheduleDeleteController = controllerTest("ScheduleDeleteController");
		}));

		it("should make the passed schedule available to the view", function() {
			scheduleDeleteController.schedule.should.deep.equal(schedule);
		});

		describe("deleteSchedule", function() {
			it("should reset any previous error messages", function() {
				scheduleDeleteController.errorMessage = "error message";
				scheduleDeleteController.deleteSchedule();
				(null === scheduleDeleteController.errorMessage).should.be.true;
			});

			it("should delete the schedule", function() {
				scheduleDeleteController.deleteSchedule();
				scheduleModel.destroy.should.have.been.calledWith(schedule);
			});

			it("should close the modal when the schedule delete is successful", function() {
				scheduleDeleteController.deleteSchedule();
				$modalInstance.close.should.have.been.called;
			});

			it("should display an error message when the schedule delete is unsuccessful", function() {
				scheduleDeleteController.schedule.id = -1;
				scheduleDeleteController.deleteSchedule();
				scheduleDeleteController.errorMessage.should.equal("unsuccessful");
			});
		});

		describe("cancel", function() {
			it("should dismiss the modal", function() {
				scheduleDeleteController.cancel();
				$modalInstance.dismiss.should.have.been.called;
			});
		});
	});
})();
