import {
	StateMock,
	UibModalMock,
	UibModalMockResolves
} from "mocks/node-modules/angular/types";
import sinon, { SinonStub } from "sinon";
import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { OgModalAlert } from "og-components/og-modal-alert/types";
import { OgTableActionHandlers } from "og-components/og-table-navigable/types";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import { Payee } from "payees/types";
import PayeeIndexController from "payees/controllers";
import { PayeeModelMock } from "mocks/payees/types";
import angular from "angular";
import createPayee from "mocks/payees/factories";

describe("PayeeIndexController", (): void => {
	let	payeeIndexController: PayeeIndexController,
			controllerTest: ControllerTestFactory,
			$transitions: angular.ui.IStateParamsService,
			$timeout: angular.ITimeoutService,
			$uibModal: UibModalMock,
			$state: StateMock,
			payeeModel: PayeeModelMock,
			ogTableNavigableService: OgTableNavigableService,
			payees: Payee[],
			deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootPayees", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "$state", "payeeModel", "payees"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$transitions_: angular.ui.IStateParamsService, _$timeout_: angular.ITimeoutService, _$uibModal_: UibModalMock, _$state_: StateMock, _payeeModel_: PayeeModelMock, _ogTableNavigableService_: OgTableNavigableService, _payees_: Payee[]): void => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		payeeModel = _payeeModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		payees = _payees_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		payeeIndexController = controllerTest("PayeeIndexController") as PayeeIndexController;
	}));

	it("should make the passed payees available to the view", (): Chai.Assertion => payeeIndexController.payees.should.deep.equal(payees));

	it("should focus the payee when a payee id is specified", (): void => {
		$state.params.id = "1";
		payeeIndexController = controllerTest("PayeeIndexController", { $state }) as PayeeIndexController;
		payeeIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		(payeeIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(0);
	});

	it("should not focus the payee when a payee id is not specified", (): void =>	$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion => $transitions.onSuccess.should.have.been.calledWith({ to: "root.payees.payee" }, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(payeeIndexController as angular.IController).$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the payee is focussed when the payee id state param changes", (): void => {
		const toParams: {id: string;} = { id: "1" };

		sinon.stub(payeeIndexController, "focusPayee" as keyof PayeeIndexController);
		$transitions.onSuccess.firstCall.args[1]({ params: sinon.stub().withArgs("to").returns(toParams) });
		payeeIndexController["focusPayee"].should.have.been.calledWith(Number(toParams.id));
	});

	describe("editPayee", (): void => {
		let payee: Payee;

		beforeEach((): void => {
			sinon.stub(payeeIndexController, "focusPayee" as keyof PayeeIndexController);
			payee = angular.copy(payeeIndexController.payees[1]);
		});

		it("should disable navigation on the table", (): void => {
			payeeIndexController.editPayee();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void => payeeIndexController.editPayee(1));

			it("should open the edit payee modal with a payee", (): void => {
				$uibModal.open.should.have.been.called;
				payeeModel.addRecent.should.have.been.calledWith(payee);
				(($uibModal.resolves as UibModalMockResolves).payee as Payee).should.deep.equal(payee);
			});

			it("should update the payee in the list of payees when the modal is closed", (): void => {
				payee.name = "edited payee";
				$uibModal.close(payee);
				payeeIndexController.payees.should.include(payee);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				payee = createPayee({
					id: 999,
					name: "new payee"
				});
				payeeIndexController.editPayee();
			});

			it("should open the edit payee modal without a payee", (): void => {
				$uibModal.open.should.have.been.called;
				payeeModel.addRecent.should.not.have.been.called;
				(!($uibModal.resolves as UibModalMockResolves).payee).should.be.true;
			});

			it("should add the new payee to the list of payees when the modal is closed", (): void => {
				$uibModal.close(payee);
				(payeeIndexController.payees.pop() as Payee).should.deep.equal(payee);
			});

			it("should add the new payee to the recent list", (): void => {
				$uibModal.close(payee);
				payeeModel.addRecent.should.have.been.calledWith(payee);
			});
		});

		it("should resort the payees list when the modal is closed", (): void => {
			const payeeWithHighestName: Payee = angular.copy(payeeIndexController.payees[2]);

			payeeIndexController.editPayee();
			$uibModal.close(payee);
			(payeeIndexController.payees.pop() as Payee).should.deep.equal(payeeWithHighestName);
		});

		it("should focus the payee when the modal is closed", (): void => {
			payeeIndexController.editPayee();
			$uibModal.close(payee);
			payeeIndexController["focusPayee"].should.have.been.calledWith(payee.id);
		});

		it("should not change the payees list when the modal is dismissed", (): void => {
			const originalPayees = angular.copy(payeeIndexController.payees);

			payeeIndexController.editPayee();
			$uibModal.dismiss();
			payeeIndexController.payees.should.deep.equal(originalPayees);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			payeeIndexController.editPayee();
			$uibModal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			payeeIndexController.editPayee();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deletePayee", (): void => {
		let payee: Payee;

		beforeEach((): Payee => (payee = angular.copy(payeeIndexController.payees[1])));

		it("should fetch the payee", (): void => {
			payeeIndexController.deletePayee(1);
			payeeModel.find.should.have.been.calledWith(payee.id);
		});

		it("should disable navigation on the table", (): void => {
			payeeIndexController.deletePayee(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should show an alert if the payee has transactions", (): void => {
			payeeIndexController.deletePayee(2);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert).header.should.equal("Payee has existing transactions");
		});

		it("should show the delete payee modal if the payee has no transactions", (): void => {
			payeeIndexController.deletePayee(1);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).payee as Payee).should.deep.equal(payee);
		});

		it("should remove the payee from the payees list when the modal is closed", (): void => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			payeeIndexController.payees.should.not.include(payee);
		});

		it("should transition to the payees list when the modal is closed", (): void => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			$state.go.should.have.been.calledWith("root.payees");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			payeeIndexController.deletePayee(1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("toggleFavourite", (): void => {
		let payee: Payee;

		beforeEach((): Payee[] => ([payee] = payeeIndexController.payees));

		it("should favourite the payee", (): void => {
			payee.favourite = false;
			payeeIndexController.toggleFavourite(0);
			payee.favourite.should.be.true;
		});

		it("should unfavourite the payee", (): void => {
			payee.favourite = true;
			payeeIndexController.toggleFavourite(0);
			payee.favourite.should.be.false;
		});

		afterEach((): Chai.Assertion => payeeModel.toggleFavourite.should.have.been.called);
	});

	describe("tableActions.selectAction", (): void => {
		it("should transition to the payee transactions list", (): void => {
			payeeIndexController.tableActions.selectAction();
			$state.go.should.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the payee", (): void => {
			sinon.stub(payeeIndexController, "editPayee");
			payeeIndexController.tableActions.editAction(1);
			payeeIndexController.editPayee.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a payee", (): void => {
			sinon.stub(payeeIndexController, "editPayee");
			payeeIndexController.tableActions.insertAction();
			payeeIndexController.editPayee.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a payee", (): void => {
			sinon.stub(payeeIndexController, "deletePayee");
			payeeIndexController.tableActions.deleteAction(1);
			payeeIndexController.deletePayee.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a payee when no payee is currently focussed", (): void => {
			payeeIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".payee", { id: 2 });
		});

		it("should focus a payee when another payee is currently focussed", (): void => {
			$state.currentState("**.payee");
			payeeIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.payee", { id: 2 });
		});
	});

	describe("focusPayee", (): void => {
		beforeEach((): SinonStub => (payeeIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific payee row could not be found", (): void => {
			(!payeeIndexController["focusPayee"](999)).should.be.true;
			(payeeIndexController.tableActions as OgTableActionHandlers).focusRow.should.not.have.been.called;
		});

		it("should focus the payee row for the specified payee", (): void => {
			const targetIndex: number = payeeIndexController["focusPayee"](1);

			$timeout.flush();
			(payeeIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified payee", (): void => {
			const targetIndex: number = payeeIndexController["focusPayee"](1);

			targetIndex.should.equal(0);
		});
	});
});
