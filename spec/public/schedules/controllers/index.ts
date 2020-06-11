import {
	ControllerTestFactory,
	JQueryMouseEventObjectMock
} from "mocks/types";
import {
	ScheduledSplitTransaction,
	ScheduledTransaction
} from "schedules/types";
import {
	SplitTransactionChild,
	SplitTransactionType
} from "transactions/types";
import {
	StateMock,
	UibModalMock,
	UibModalMockResolves
} from "mocks/node-modules/angular/types";
import {
	createScheduledBasicTransaction,
	createScheduledSplitTransaction
} from "mocks/schedules/factories";
import {
	createSubtransaction,
	createSubtransferTransaction
} from "mocks/transactions/factories";
import sinon, { SinonStub } from "sinon";
import {
	startOfDay,
	subDays
} from "date-fns";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { OgTableActionHandlers } from "og-components/og-table-navigable/types";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import ScheduleIndexController from "schedules/controllers";
import { TransactionModelMock } from "mocks/transactions/types";
import angular from "angular";

describe("ScheduleIndexController", (): void => {
	let	scheduleIndexController: ScheduleIndexController,
			controllerTest: ControllerTestFactory,
			$transitions: angular.ui.IStateParamsService,
			$uibModal: UibModalMock,
			$timeout: angular.ITimeoutService,
			$state: StateMock,
			transactionModel: TransactionModelMock,
			ogTableNavigableService: OgTableNavigableService,
			schedules: ScheduledTransaction[],
			deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "$state", "scheduleModel", "transactionModel", "schedules"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$transitions_: angular.ui.IStateParamsService, _$uibModal_: UibModalMock, _$timeout_: angular.ITimeoutService, _$state_: StateMock, _transactionModel_: TransactionModelMock, _ogTableNavigableService_: OgTableNavigableService, _schedules_: ScheduledTransaction[]): void => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$uibModal = _$uibModal_;
		$timeout = _$timeout_;
		$state = _$state_;
		transactionModel = _transactionModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		schedules = _schedules_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		scheduleIndexController = controllerTest("ScheduleIndexController") as ScheduleIndexController;
	}));

	it("should make the passed schedules available to the view", (): Chai.Assertion => scheduleIndexController.schedules.should.deep.equal(schedules));

	it("should make today's date available to the view", (): Chai.Assertion => scheduleIndexController.today.should.deep.equal(startOfDay(new Date())));

	it("should focus the schedule when a schedule id is specified", (): void => {
		$state.params.id = "1";
		scheduleIndexController = controllerTest("ScheduleIndexController", { $state }) as ScheduleIndexController;
		scheduleIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		(scheduleIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(0);
	});

	it("should not focus the schedule when a schedule id is not specified", (): void =>	$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion => $transitions.onSuccess.should.have.been.calledWith({ to: "root.schedules.schedule" }, sinon.match.func) as Chai.Assertion);

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(scheduleIndexController as angular.IController).$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the schedule is focussed when the schedule id state param changes", (): void => {
		const toParams: {id: string;} = { id: "1" };

		sinon.stub(scheduleIndexController, "focusSchedule" as keyof ScheduleIndexController);
		$transitions.onSuccess.firstCall.args[1]({ params: sinon.stub().withArgs("to").returns(toParams) });
		scheduleIndexController["focusSchedule"].should.have.been.calledWith(Number(toParams.id));
	});

	describe("editSchedule", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach((): void => {
			sinon.stub(scheduleIndexController, "focusSchedule" as keyof ScheduleIndexController);
			schedule = angular.copy(scheduleIndexController.schedules[1]);
		});

		it("should disable navigation on the table", (): void => {
			scheduleIndexController["editSchedule"]();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", (): void => {
			it("should open the edit schedule modal with a schedule", (): void => {
				scheduleIndexController["editSchedule"](1);
				$uibModal.open.should.have.been.called;
				(($uibModal.resolves as UibModalMockResolves).schedule as ScheduledTransaction).should.deep.equal(schedule);
				transactionModel.findSubtransactions.should.not.have.been.called;
			});

			const scenarios: SplitTransactionType[] = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it(`should prefetch the subtransactions for a ${scenario} transaction`, (): void => {
					scheduleIndexController.schedules[1].transaction_type = scenario;
					scheduleIndexController["editSchedule"](1);
					transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
					(($uibModal.resolves as UibModalMockResolves).schedule as angular.IPromise<ScheduledTransaction>).then((scheduledTransaction: ScheduledTransaction): Chai.Assertion => scheduledTransaction.should.have.property("subtransactions"));
				});
			});

			it("should update the schedule in the list of schedules when the modal is closed", (): void => {
				schedule.memo = "edited schedule";
				scheduleIndexController["editSchedule"](1);
				$uibModal.close({ data: schedule });
				scheduleIndexController.schedules.should.include(schedule);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				schedule = createScheduledBasicTransaction();
				scheduleIndexController["editSchedule"]();
			});

			it("should open the edit schedule modal without a schedule", (): void => {
				$uibModal.open.should.have.been.called;
				(undefined === ($uibModal.resolves as UibModalMockResolves).schedule).should.be.true;
			});

			it("should add the new schedule to the list of schedules when the modal is closed", (): void => {
				$uibModal.close({ data: schedule });
				(scheduleIndexController.schedules.pop() as ScheduledTransaction).should.deep.equal(schedule);
			});
		});

		it("should resort the schedule list when the modal is closed", (): void => {
			schedule.id = 999;
			schedule.next_due_date = subDays(startOfDay(new Date()), 1);
			scheduleIndexController["editSchedule"](1);
			$uibModal.close({ data: schedule });
			(scheduleIndexController.schedules.pop() as ScheduledTransaction).should.deep.equal(schedule);
		});

		it("should focus the schedule when the modal is closed if the schedule was edited", (): void => {
			schedule.next_due_date = subDays(startOfDay(new Date()), 1);
			scheduleIndexController["editSchedule"](1);
			$uibModal.close({ data: schedule });
			scheduleIndexController["focusSchedule"].should.have.been.calledWith(schedule.id);
		});

		it("should focus the schedule now at the original index when the modal is closed if the schedule was entered or skipped", (): void => {
			schedule.next_due_date = subDays(startOfDay(new Date()), 1);
			scheduleIndexController["editSchedule"](1);
			$uibModal.close({ data: schedule, skipped: true });
			scheduleIndexController["focusSchedule"].should.have.been.calledWith(scheduleIndexController.schedules[1].id);
		});

		it("should not change the schedules list when the modal is dismissed", (): void => {
			const originalSchedules: ScheduledTransaction[] = angular.copy(scheduleIndexController.schedules);

			scheduleIndexController["editSchedule"]();
			$uibModal.dismiss();
			scheduleIndexController.schedules.should.deep.equal(originalSchedules);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			scheduleIndexController["editSchedule"]();
			$uibModal.close({ data: schedule });
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			scheduleIndexController["editSchedule"]();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deleteSchedule", (): void => {
		let schedule: ScheduledTransaction;

		beforeEach((): ScheduledTransaction => (schedule = angular.copy(scheduleIndexController.schedules[1])));

		it("should disable navigation on the table", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should open the delete schedule modal with a schedule", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).schedule as ScheduledTransaction).should.deep.equal(schedule);
		});

		it("should remove the schedule from the schedules list when the modal is closed", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			$uibModal.close(schedule);
			scheduleIndexController.schedules.should.not.include(schedule);
		});

		it("should transition to the parent state", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			$uibModal.close(schedule);
			$state.go.should.have.been.calledWith("root.schedules");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			$uibModal.close(schedule);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			scheduleIndexController["deleteSchedule"](1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", (): void => {
		it("should edit the schedule", (): void => {
			sinon.stub(scheduleIndexController, "editSchedule" as keyof ScheduleIndexController);
			scheduleIndexController.tableActions.selectAction(1);
			scheduleIndexController["editSchedule"].should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the schedule", (): void => {
			sinon.stub(scheduleIndexController, "editSchedule" as keyof ScheduleIndexController);
			scheduleIndexController.tableActions.editAction(1);
			scheduleIndexController["editSchedule"].should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a schedule", (): void => {
			sinon.stub(scheduleIndexController, "editSchedule" as keyof ScheduleIndexController);
			scheduleIndexController.tableActions.insertAction();
			scheduleIndexController["editSchedule"].should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a schedule", (): void => {
			sinon.stub(scheduleIndexController, "deleteSchedule" as keyof ScheduleIndexController);
			scheduleIndexController.tableActions.deleteAction(1);
			scheduleIndexController["deleteSchedule"].should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a schedule when no schedule is currently focussed", (): void => {
			scheduleIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".schedule", { id: 2 });
		});

		it("should focus a schedule when another schedule is currently focussed", (): void => {
			$state.currentState("**.schedule");
			scheduleIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.schedule", { id: 2 });
		});
	});

	describe("focusSchedule", (): void => {
		beforeEach((): SinonStub => (scheduleIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific schedule row could not be found", (): void => {
			scheduleIndexController["focusSchedule"](999).should.be.NaN;
			(scheduleIndexController.tableActions as OgTableActionHandlers).focusRow.should.not.have.been.called;
		});

		it("should focus the schedule row for the specified schedule", (): void => {
			const targetIndex: number = scheduleIndexController["focusSchedule"](1);

			$timeout.flush();
			(scheduleIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified schedule", (): void => {
			const targetIndex: number = scheduleIndexController["focusSchedule"](1);

			targetIndex.should.equal(0);
		});
	});

	describe("toggleSubtransactions", (): void => {
		let	event: JQueryMouseEventObjectMock,
				schedule: ScheduledSplitTransaction;

		beforeEach((): void => {
			event = { cancelBubble: false };
			schedule = createScheduledSplitTransaction({ id: -1, showSubtransactions: true });
		});

		it("should toggle a flag on the schedule indicating whether subtransactions are shown", (): void => {
			scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
			schedule.showSubtransactions.should.be.false;
		});

		it("should do nothing if we're not showing subtransactions", (): void => {
			scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
			transactionModel.findSubtransactions.should.not.have.been.called;
		});

		describe("(on shown)", (): void => {
			beforeEach((): void => {
				schedule.showSubtransactions = false;
				schedule.loadingSubtransactions = false;
				delete schedule.subtransactions;
			});

			it("should show a loading indicator", (): void => {
				scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
				schedule.showSubtransactions.should.be.true;
				schedule.loadingSubtransactions.should.be.true;
			});

			it("should clear the subtransactions for the schedule", (): void => {
				scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
				schedule.subtransactions.should.be.an("array");
				schedule.subtransactions.should.be.empty;
			});

			it("should fetch the subtransactions", (): void => {
				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
				transactionModel.findSubtransactions.should.have.been.calledWith(schedule.id);
			});

			it("should update the transaction with it's subtransactions", (): void => {
				const subtransactions: SplitTransactionChild[] = [
					createSubtransferTransaction({ id: 1 }),
					createSubtransaction({ id: 2 }),
					createSubtransaction({ id: 3 })
				];

				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
				schedule.subtransactions.should.deep.equal(subtransactions);
			});

			it("should hide the loading indicator", (): void => {
				schedule.id = 1;
				scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
				schedule.loadingSubtransactions.should.be.false;
			});
		});

		it("should prevent the event from bubbling", (): void => {
			scheduleIndexController.toggleSubtransactions(event as JQueryMouseEventObject, schedule);
			(event.cancelBubble as boolean).should.be.true;
		});
	});
});
