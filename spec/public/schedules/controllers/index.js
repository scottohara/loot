describe("ScheduleIndexController", () => {
	let	scheduleIndexController,
			controllerTest,
			$modal,
			$timeout,
			$state,
			transactionModel,
			ogTableNavigableService,
			schedules;

	// Load the modules
	beforeEach(module("lootMocks", "lootSchedules", mockDependenciesProvider => mockDependenciesProvider.load(["$modal", "$state", "scheduleModel", "transactionModel", "schedules"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$modal_, _$timeout_, _$state_, _transactionModel_, _ogTableNavigableService_, _schedules_) => {
		controllerTest = _controllerTest_;
		$modal = _$modal_;
		$timeout = _$timeout_;
		$state = _$state_;
		transactionModel = _transactionModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		schedules = _schedules_;
		scheduleIndexController = controllerTest("ScheduleIndexController");
	}));

	it("should make the passed schedules available to the view", () => scheduleIndexController.schedules.should.deep.equal(schedules));

	it("should make today's date available to the view", () => scheduleIndexController.today.should.deep.equal(moment().startOf("day").toDate()));

	describe("editSchedule", () => {
		let schedule;

		beforeEach(() => {
			sinon.stub(scheduleIndexController, "focusSchedule");
			schedule = angular.copy(scheduleIndexController.schedules[1]);
		});

		it("should disable navigation on the table", () => {
			scheduleIndexController.editSchedule();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", () => {
			it("should open the edit schedule modal with a schedule", () => {
				scheduleIndexController.editSchedule(1);
				$modal.open.should.have.been.called;
				$modal.resolves.schedule.should.deep.equal(schedule);
				transactionModel.findSubtransactions.should.not.have.been.called;
			});

			const scenarios = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach(scenario => {
				it(`should prefetch the subtransactions for a ${scenario} transaction`, () => {
					scheduleIndexController.schedules[1].transaction_type = scenario;
					scheduleIndexController.editSchedule(1);
					transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
					$modal.resolves.schedule.should.eventually.have.a.property("subtransactions");
				});
			});

			it("should update the schedule in the list of schedules when the modal is closed", () => {
				schedule.memo = "edited schedule";
				scheduleIndexController.editSchedule(1);
				$modal.close({data: schedule});
				scheduleIndexController.schedules.should.include(schedule);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				schedule = {id: 999, memo: "new schedule"};
				scheduleIndexController.editSchedule();
			});

			it("should open the edit schedule modal without a schedule", () => {
				$modal.open.should.have.been.called;
				(null === $modal.resolves.schedule).should.be.true;
			});

			it("should add the new schedule to the list of schedules when the modal is closed", () => {
				$modal.close({data: schedule});
				scheduleIndexController.schedules.pop().should.deep.equal(schedule);
			});
		});

		it("should resort the schedule list when the modal is closed", () => {
			schedule.id = 999;
			schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
			scheduleIndexController.editSchedule(1);
			$modal.close({data: schedule});
			scheduleIndexController.schedules.pop().should.deep.equal(schedule);
		});

		it("should focus the schedule when the modal is closed if the schedule was edited", () => {
			schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
			scheduleIndexController.editSchedule(1);
			$modal.close({data: schedule});
			scheduleIndexController.focusSchedule.should.have.been.calledWith(schedule.id);
		});

		it("should focus the schedule now at the original index when the modal is closed if the schedule was entered or skipped", () => {
			schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
			scheduleIndexController.editSchedule(1);
			$modal.close({data: schedule, skipped: true});
			scheduleIndexController.focusSchedule.should.have.been.calledWith(scheduleIndexController.schedules[1].id);
		});

		it("should not change the schedules list when the modal is dismissed", () => {
			const originalSchedules = angular.copy(scheduleIndexController.schedules);

			scheduleIndexController.editSchedule();
			$modal.dismiss();
			scheduleIndexController.schedules.should.deep.equal(originalSchedules);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			scheduleIndexController.editSchedule();
			$modal.close({data: schedule});
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			scheduleIndexController.editSchedule();
			$modal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deleteSchedule", () => {
		let schedule;

		beforeEach(() => schedule = angular.copy(scheduleIndexController.schedules[1]));

		it("should disable navigation on the table", () => {
			scheduleIndexController.deleteSchedule(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should open the delete schedule modal with a schedule", () => {
			scheduleIndexController.deleteSchedule(1);
			$modal.open.should.have.been.called;
			$modal.resolves.schedule.should.deep.equal(schedule);
		});

		it("should remove the schedule from the schedules list when the modal is closed", () => {
			scheduleIndexController.deleteSchedule(1);
			$modal.close(schedule);
			scheduleIndexController.schedules.should.not.include(schedule);
		});

		it("should transition to the parent state", () => {
			scheduleIndexController.deleteSchedule(1);
			$modal.close(schedule);
			$state.go.should.have.been.calledWith("root.schedules");
		});

		it("should enable navigation on the table when the modal is closed", () => {
			scheduleIndexController.deleteSchedule(1);
			$modal.close(schedule);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			scheduleIndexController.deleteSchedule(1);
			$modal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", () => {
		it("should edit the schedule", () => {
			sinon.stub(scheduleIndexController, "editSchedule");
			scheduleIndexController.tableActions.selectAction(1);
			scheduleIndexController.editSchedule.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.editAction", () => {
		it("should edit the schedule", () => {
			sinon.stub(scheduleIndexController, "editSchedule");
			scheduleIndexController.tableActions.editAction(1);
			scheduleIndexController.editSchedule.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", () => {
		it("should insert a schedule", () => {
			sinon.stub(scheduleIndexController, "editSchedule");
			scheduleIndexController.tableActions.insertAction();
			scheduleIndexController.editSchedule.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", () => {
		it("should delete a schedule", () => {
			sinon.stub(scheduleIndexController, "deleteSchedule");
			scheduleIndexController.tableActions.deleteAction(1);
			scheduleIndexController.deleteSchedule.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", () => {
		it("should focus a schedule when no schedule is currently focussed", () => {
			scheduleIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".schedule", {id: 2});
		});

		it("should focus a schedule when another schedule is currently focussed", () => {
			$state.currentState("**.schedule");
			scheduleIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.schedule", {id: 2});
		});
	});

	describe("focusSchedule", () => {
		beforeEach(() => scheduleIndexController.tableActions.focusRow = sinon.stub());

		it("should do nothing when the specific schedule row could not be found", () => {
			(!scheduleIndexController.focusSchedule(999)).should.be.true;
			scheduleIndexController.tableActions.focusRow.should.not.have.been.called;
		});

		it("should focus the schedule row for the specified schedule", () => {
			const targetIndex = scheduleIndexController.focusSchedule(1);

			$timeout.flush();
			scheduleIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified schedule", () => {
			const targetIndex = scheduleIndexController.focusSchedule(1);

			targetIndex.should.equal(0);
		});
	});

	describe("toggleSubtransactions", () => {
		let	event,
				schedule;

		beforeEach(() => {
			event = {
				cancelBubble: false
			};
			schedule = {
				id: -1,
				showSubtransactions: true
			};
		});

		it("should toggle a flag on the schedule indicating whether subtransactions are shown", () => {
			scheduleIndexController.toggleSubtransactions(event, schedule);
			schedule.showSubtransactions.should.be.false;
		});

		it("should do nothing if we're not showing subtransactions", () => {
			scheduleIndexController.toggleSubtransactions(event, schedule);
			transactionModel.findSubtransactions.should.not.have.been.called;
		});

		describe("(on shown)", () => {
			beforeEach(() => {
				schedule.showSubtransactions = false;
				schedule.loadingSubtransactions = false;
				schedule.subtransactions = null;
			});

			it("should show a loading indicator", () => {
				scheduleIndexController.toggleSubtransactions(event, schedule);
				schedule.showSubtransactions.should.be.true;
				schedule.loadingSubtransactions.should.be.true;
			});

			it("should clear the subtransactions for the schedule", () => {
				scheduleIndexController.toggleSubtransactions(event, schedule);
				schedule.subtransactions.should.be.an.Array;
				schedule.subtransactions.should.be.empty;
			});

			it("should fetch the subtransactions", () => {
				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event, schedule);
				transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
			});

			it("should update the transaction with it's subtransactions", () => {
				const subtransactions = [
					{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
					{id: 2, category: "subtransaction category"},
					{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
				];

				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event, schedule);
				schedule.subtransactions.should.deep.equal(subtransactions);
			});

			it("should hide the loading indicator", () => {
				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event, schedule);
				schedule.loadingSubtransactions.should.be.false;
			});
		});

		it("should prevent the event from bubbling", () => {
			scheduleIndexController.toggleSubtransactions(event, schedule);
			event.cancelBubble.should.be.true;
		});
	});

	describe("stateChangeSuccessHandler", () => {
		let	toState,
				toParams,
				fromState,
				fromParams;

		beforeEach(() => {
			toState = {name: "state"};
			toParams = {id: 1};
			fromState = angular.copy(toState);
			fromParams = angular.copy(toParams);
			sinon.stub(scheduleIndexController, "focusSchedule");
		});

		it("should do nothing when an id state parameter is not specified", () => {
			Reflect.deleteProperty(toParams, "id");
			scheduleIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			scheduleIndexController.focusSchedule.should.not.have.been.called;
		});

		it("should do nothing when state parameters have not changed", () => {
			scheduleIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			scheduleIndexController.focusSchedule.should.not.have.been.called;
		});

		it("should ensure the transaction is focussed when the state name changes", () => {
			toState.name = "new state";
			scheduleIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			scheduleIndexController.focusSchedule.should.have.been.calledWith(toParams.id);
		});

		it("should ensure the transaction is focussed when the schedule id state param changes", () => {
			toParams.id = 2;
			scheduleIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			scheduleIndexController.focusSchedule.should.have.been.calledWith(toParams.id);
		});
	});

	it("should attach a state change success handler", () => {
		sinon.stub(scheduleIndexController, "stateChangeSuccessHandler");
		scheduleIndexController.$scope.$emit("$stateChangeSuccess");
		scheduleIndexController.stateChangeSuccessHandler.should.have.been.called;
	});
});
