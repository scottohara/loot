(function() {
	"use strict";

	/*jshint expr: true */

	describe("ScheduleIndexController", function() {
		// The object under test
		var scheduleIndexController;

		// Dependencies
		var controllerTest,
				$modal,
				$timeout,
				$state,
				scheduleModel,
				transactionModel,
				ogTableNavigableService,
				schedules;

		// Load the modules
		beforeEach(module("lootMocks", "schedules", function(mockDependenciesProvider) {
			mockDependenciesProvider.load(["$modal", "$state", "scheduleModel", "transactionModel", "schedules"]);
		}));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_, _$modal_, _$timeout_, _$state_, _scheduleModel_, _transactionModel_, _ogTableNavigableService_, _schedules_) {
			controllerTest = _controllerTest_;
			$modal = _$modal_;
			$timeout = _$timeout_;
			$state = _$state_;
			scheduleModel = _scheduleModel_;
			transactionModel = _transactionModel_;
			ogTableNavigableService = _ogTableNavigableService_;
			schedules = _schedules_;
			scheduleIndexController = controllerTest("ScheduleIndexController");
		}));

		it("should make the passed schedules available to the view", function() {
			scheduleIndexController.schedules.should.deep.equal(schedules);
		});

		it("should make today's date available to the view", function() {
			scheduleIndexController.today.should.deep.equal(moment().startOf("day").toDate());
		});

		describe("editSchedule", function() {
			var schedule;

			beforeEach(function() {
				sinon.stub(scheduleIndexController, "focusSchedule");
				schedule = angular.copy(scheduleIndexController.schedules[1]);
			});

			it("should disable navigation on the table", function() {
				scheduleIndexController.editSchedule();
				ogTableNavigableService.enabled.should.be.false;
			});

			describe("(edit existing)", function() {
				it("should open the edit schedule modal with a schedule", function() {
					scheduleIndexController.editSchedule(1);
					$modal.open.should.have.been.called;
					$modal.resolves.schedule.should.deep.equal(schedule);
					transactionModel.findSubtransactions.should.not.have.been.called;
				});

				var scenarios = ["Split", "LoanRepayment", "Payslip"];

				scenarios.forEach(function(scenario) {
					it("should prefetch the subtransactions for a " + scenario + " transaction", function() {
						scheduleIndexController.schedules[1].transaction_type = scenario;
						scheduleIndexController.editSchedule(1);
						transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
						$modal.resolves.schedule.should.eventually.have.a.property("subtransactions");
					});
				});
				
				it("should update the schedule in the list of schedules when the modal is closed", function() {
					schedule.memo = "edited schedule";
					scheduleIndexController.editSchedule(1);
					$modal.close({data: schedule});
					scheduleIndexController.schedules.should.include(schedule);
				});
			});

			describe("(add new)", function() {
				beforeEach(function() {
					schedule = {id: 999, memo: "new schedule"};
					scheduleIndexController.editSchedule();
				});

				it("should open the edit schedule modal without a schedule", function() {
					$modal.open.should.have.been.called;
					(null === $modal.resolves.schedule).should.be.true;
				});

				it("should add the new schedule to the list of schedules when the modal is closed", function() {
					$modal.close({data: schedule});
					scheduleIndexController.schedules.pop().should.deep.equal(schedule);
				});
			});

			it("should resort the schedule list when the modal is closed", function() {
				schedule.id = 999;
				schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
				scheduleIndexController.editSchedule(1);
				$modal.close({data: schedule});
				scheduleIndexController.schedules.pop().should.deep.equal(schedule);
			});

			it("should focus the schedule when the modal is closed if the schedule was edited", function() {
				schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
				scheduleIndexController.editSchedule(1);
				$modal.close({data: schedule});
				scheduleIndexController.focusSchedule.should.have.been.calledWith(schedule.id);
			});

			it("should focus the schedule now at the original index when the modal is closed if the schedule was entered or skipped", function() {
				schedule.next_due_date = moment().startOf("day").subtract(1, "day").toDate();
				scheduleIndexController.editSchedule(1);
				$modal.close({data: schedule, skipped: true});
				scheduleIndexController.focusSchedule.should.have.been.calledWith(scheduleIndexController.schedules[1].id);
			});

			it("should not change the schedules list when the modal is dismissed", function() {
				var originalSchedules = angular.copy(scheduleIndexController.schedules);
				scheduleIndexController.editSchedule();
				$modal.dismiss();
				scheduleIndexController.schedules.should.deep.equal(originalSchedules);
			});

			it("should enable navigation on the table when the modal is closed", function() {
				scheduleIndexController.editSchedule();
				$modal.close({data: schedule});
				ogTableNavigableService.enabled.should.be.true;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				scheduleIndexController.editSchedule();
				$modal.dismiss();
				ogTableNavigableService.enabled.should.be.true;
			});
		});

		describe("deleteSchedule", function() {
			var schedule;

			beforeEach(function() {
				schedule = angular.copy(scheduleIndexController.schedules[1]);
			});

			it("should disable navigation on the table", function() {
				scheduleIndexController.deleteSchedule(1);
				ogTableNavigableService.enabled.should.be.false;
			});

			it("should open the delete schedule modal with a schedule", function() {
				scheduleIndexController.deleteSchedule(1);
				$modal.open.should.have.been.called;
				$modal.resolves.schedule.should.deep.equal(schedule);
			});

			it("should remove the schedule from the schedules list when the modal is closed", function() {
				scheduleIndexController.deleteSchedule(1);
				$modal.close(schedule);
				scheduleIndexController.schedules.should.not.include(schedule);
			});

			it("should transition to the parent state", function() {
				scheduleIndexController.deleteSchedule(1);
				$modal.close(schedule);
				$state.go.should.have.been.calledWith("root.schedules");
			});

			it("should enable navigation on the table when the modal is closed", function() {
				scheduleIndexController.deleteSchedule(1);
				$modal.close(schedule);
				ogTableNavigableService.enabled.should.be.true;
			});

			it("should enable navigation on the table when the modal is dimissed", function() {
				scheduleIndexController.deleteSchedule(1);
				$modal.dismiss();
				ogTableNavigableService.enabled.should.be.true;
			});
		});

		describe("tableActions.selectAction", function() {
			it("should edit the schedule", function() {
				scheduleIndexController.tableActions.selectAction.should.equal(scheduleIndexController.editSchedule);
			});
		});

		describe("tableActions.editAction", function() {
			it("should edit the schedule", function() {
				scheduleIndexController.tableActions.editAction.should.equal(scheduleIndexController.editSchedule);
			});
		});

		describe("tableActions.insertAction", function() {
			it("should insert a schedule", function() {
				sinon.stub(scheduleIndexController, "editSchedule");
				scheduleIndexController.tableActions.insertAction();
				scheduleIndexController.editSchedule.should.have.been.calledWith(undefined);
			});
		});

		describe("tableActions.deleteAction", function() {
			it("should delete a schedule", function() {
				scheduleIndexController.tableActions.deleteAction.should.equal(scheduleIndexController.deleteSchedule);
			});
		});

		describe("tableActions.focusAction", function() {
			it("should focus a schedule when no schedule is currently focussed", function() {
				scheduleIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith(".schedule", {id: 2});
			});

			it("should focus a schedule when another schedule is currently focussed", function() {
				$state.currentState("**.schedule");
				scheduleIndexController.tableActions.focusAction(1);
				$state.go.should.have.been.calledWith("^.schedule", {id: 2});
			});
		});

		describe("focusSchedule", function() {
			beforeEach(function() {
				scheduleIndexController.tableActions.focusRow = sinon.stub();
			});

			it("should do nothing when the specific schedule row could not be found", function() {
				(undefined === scheduleIndexController.focusSchedule(999)).should.be.true;
				scheduleIndexController.tableActions.focusRow.should.not.have.been.called;
			});

			it("should focus the schedule row for the specified schedule", function() {
				var targetIndex = scheduleIndexController.focusSchedule(1);
				$timeout.flush();
				scheduleIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
			});

			it("should return the index of the specified schedule", function() {
				var targetIndex = scheduleIndexController.focusSchedule(1);
				targetIndex.should.equal(0);
			});
		});

		describe("toggleSubtransactions", function() {
			var event,
					schedule;

			beforeEach(function() {
				event = {
					cancelBubble: false
				};
				schedule = {
					id: -1,
					showSubtransactions: true
				};
			});

			it("should toggle a flag on the schedule indicating whether subtransactions are shown", function() {
				scheduleIndexController.toggleSubtransactions(event, schedule);
				schedule.showSubtransactions.should.be.false;
			});

			it("should do nothing if we're not showing subtransactions", function() {
				scheduleIndexController.toggleSubtransactions(event, schedule);
				transactionModel.findSubtransactions.should.not.have.been.called;
			});
			
			describe("(on shown)", function() {
				beforeEach(function() {
					schedule.showSubtransactions = false;
					schedule.loadingSubtransactions = false;
					schedule.subtransactions = undefined;
				});

				it("should show a loading indicator", function() {
					scheduleIndexController.toggleSubtransactions(event, schedule);
					schedule.showSubtransactions.should.be.true;
					schedule.loadingSubtransactions.should.be.true;
				});

				it("should clear the subtransactions for the schedule", function() {
					scheduleIndexController.toggleSubtransactions(event, schedule);
					schedule.subtransactions.should.be.an.Array;
					schedule.subtransactions.should.be.empty;
				});

				it("should fetch the subtransactions", function() {
					schedule.id = 1;
					scheduleIndexController.toggleSubtransactions(event, schedule);
					transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
				});

				it("should update the transaction with it's subtransactions", function() {
					var subtransactions = [
						{id: 1, transaction_type: "Transfer", account: "subtransfer account"},
						{id: 2, category: "subtransaction category"},
						{id: 3, category: "another subtransaction category", subcategory: "subtransaction subcategory"}
					];
					schedule.id = 1;
					scheduleIndexController.toggleSubtransactions(event, schedule);
					schedule.subtransactions.should.deep.equal(subtransactions);
				});

				it("should hide the loading indicator", function() {
					schedule.id = 1;
					scheduleIndexController.toggleSubtransactions(event, schedule);
					schedule.loadingSubtransactions.should.be.false;
				});
			});
 
			it("should prevent the event from bubbling", function() {
				scheduleIndexController.toggleSubtransactions(event, schedule);
				event.cancelBubble.should.be.true;
			});
		});

		describe("stateChangeSuccessHandler", function() {
			var toState,
					toParams,
					fromState,
					fromParams;

			beforeEach(function() {
				toState = {name: "state"};
				toParams = {id: 1};
				fromState = angular.copy(toState);
				fromParams = angular.copy(toParams);
				sinon.stub(scheduleIndexController, "focusSchedule");
			});

			it("should do nothing when an id state parameter is not specified", function() {
				delete toParams.id;
				scheduleIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				scheduleIndexController.focusSchedule.should.not.have.been.called;
			});

			it("should do nothing when state parameters have not changed", function() {
				scheduleIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				scheduleIndexController.focusSchedule.should.not.have.been.called;
			});

			it("should ensure the transaction is focussed when the state name changes", function() {
				toState.name = "new state";
				scheduleIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				scheduleIndexController.focusSchedule.should.have.been.calledWith(toParams.id);
			});

			it("should ensure the transaction is focussed when the schedule id state param changes", function() {
				toParams.id = 2;
				scheduleIndexController.stateChangeSuccessHandler(undefined, toState, toParams, fromState, fromParams);
				scheduleIndexController.focusSchedule.should.have.been.calledWith(toParams.id);
			});
		});

		it("should attach a state change success handler", function() {
			sinon.stub(scheduleIndexController, "stateChangeSuccessHandler");
			scheduleIndexController.$scope.$emit("$stateChangeSuccess");
			scheduleIndexController.stateChangeSuccessHandler.should.have.been.called;
		});
	});
})();
