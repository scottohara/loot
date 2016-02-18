describe("ScheduleDeleteController", () => {
	let	scheduleDeleteController,
			$uibModalInstance,
			scheduleModel,
			schedule;

	// Load the modules
	beforeEach(module("lootMocks", "lootSchedules", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "scheduleModel", "schedule"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$uibModalInstance_, _scheduleModel_, _schedule_) => {
		$uibModalInstance = _$uibModalInstance_;
		scheduleModel = _scheduleModel_;
		schedule = _schedule_;
		scheduleDeleteController = controllerTest("ScheduleDeleteController");
	}));

	it("should make the passed schedule available to the view", () => scheduleDeleteController.schedule.should.deep.equal(schedule));

	describe("deleteSchedule", () => {
		it("should reset any previous error messages", () => {
			scheduleDeleteController.errorMessage = "error message";
			scheduleDeleteController.deleteSchedule();
			(null === scheduleDeleteController.errorMessage).should.be.true;
		});

		it("should delete the schedule", () => {
			scheduleDeleteController.deleteSchedule();
			scheduleModel.destroy.should.have.been.calledWith(schedule);
		});

		it("should close the modal when the schedule delete is successful", () => {
			scheduleDeleteController.deleteSchedule();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the schedule delete is unsuccessful", () => {
			scheduleDeleteController.schedule.id = -1;
			scheduleDeleteController.deleteSchedule();
			scheduleDeleteController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			scheduleDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
