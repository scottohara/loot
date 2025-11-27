import type {
	StateMock,
	UibModalMock,
	UibModalMockResolves,
} from "~/mocks/node-modules/angular/types";
import sinon, { type SinonStub } from "sinon";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type { OgTableActionHandlers } from "~/og-components/og-table-navigable/types";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type { Payee } from "~/payees/types";
import type PayeeIndexController from "~/payees/controllers";
import type { PayeeModelMock } from "~/mocks/payees/types";
import angular from "angular";
import createPayee from "~/mocks/payees/factories";

describe("PayeeIndexController", (): void => {
	let payeeIndexController: PayeeIndexController,
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
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootPayees",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModal",
					"$state",
					"payeeModel",
					"payees",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$transitions_: angular.ui.IStateParamsService,
				_$timeout_: angular.ITimeoutService,
				_$uibModal_: UibModalMock,
				_$state_: StateMock,
				_payeeModel_: PayeeModelMock,
				_ogTableNavigableService_: OgTableNavigableService,
				_payees_: Payee[],
			): void => {
				controllerTest = _controllerTest_;
				$transitions = _$transitions_;
				$timeout = _$timeout_;
				$uibModal = _$uibModal_;
				$state = _$state_;
				payeeModel = _payeeModel_;
				ogTableNavigableService = _ogTableNavigableService_;
				payees = _payees_;
				deregisterTransitionSuccessHook = sinon.stub();
				sinon
					.stub($transitions, "onSuccess")
					.returns(deregisterTransitionSuccessHook);
				payeeIndexController = controllerTest(
					"PayeeIndexController",
				) as PayeeIndexController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed payees available to the view", (): Chai.Assertion =>
		expect(payeeIndexController.payees).to.deep.equal(payees));

	it("should focus the payee when a payee id is specified", (): void => {
		$state.params.id = "1";
		payeeIndexController = controllerTest("PayeeIndexController", {
			$state,
		}) as PayeeIndexController;
		payeeIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		expect(
			(payeeIndexController.tableActions as OgTableActionHandlers).focusRow,
		).to.have.been.calledWith(0);
	});

	it("should not focus the payee when a payee id is not specified", (): void =>
		$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion =>
		expect($transitions.onSuccess).to.have.been.calledWith(
			{ to: "root.payees.payee" },
			sinon.match.func,
		));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(payeeIndexController as angular.IController).$scope.$emit("$destroy");
		expect(deregisterTransitionSuccessHook).to.have.been.called;
	});

	it("should ensure the payee is focussed when the payee id state param changes", (): void => {
		const toParams: { id: string } = { id: "1" };

		sinon.stub(
			payeeIndexController,
			"focusPayee" as keyof PayeeIndexController,
		);
		$transitions.onSuccess.firstCall.args[1]({
			params: sinon.stub().withArgs("to").returns(toParams),
		});
		expect(payeeIndexController["focusPayee"]).to.have.been.calledWith(
			Number(toParams.id),
		);
	});

	describe("editPayee", (): void => {
		let payee: Payee;

		beforeEach((): void => {
			sinon.stub(
				payeeIndexController,
				"focusPayee" as keyof PayeeIndexController,
			);
			payee = angular.copy(payeeIndexController.payees[1]);
		});

		it("should disable navigation on the table", (): void => {
			payeeIndexController["editPayee"]();
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void => payeeIndexController["editPayee"](1));

			it("should open the edit payee modal with a payee", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(payeeModel.addRecent).to.have.been.calledWith(payee);
				expect(
					($uibModal.resolves as UibModalMockResolves).payee as Payee,
				).to.deep.equal(payee);
			});

			it("should update the payee in the list of payees when the modal is closed", (): void => {
				payee.name = "edited payee";
				$uibModal.close(payee);
				expect(payeeIndexController.payees).to.include(payee);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				payee = createPayee({
					id: 999,
					name: "new payee",
				});
				payeeIndexController["editPayee"]();
			});

			it("should open the edit payee modal without a payee", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(payeeModel.addRecent).to.not.have.been.called;
				expect(($uibModal.resolves as UibModalMockResolves).payee).to.be
					.undefined;
			});

			it("should add the new payee to the list of payees when the modal is closed", (): void => {
				$uibModal.close(payee);
				expect(payeeIndexController.payees.pop() as Payee).to.deep.equal(payee);
			});

			it("should add the new payee to the recent list", (): void => {
				$uibModal.close(payee);
				expect(payeeModel.addRecent).to.have.been.calledWith(payee);
			});
		});

		it("should resort the payees list when the modal is closed", (): void => {
			const payeeWithHighestName: Payee = angular.copy(
				payeeIndexController.payees[2],
			);

			payeeIndexController["editPayee"]();
			$uibModal.close(payee);
			expect(payeeIndexController.payees.pop() as Payee).to.deep.equal(
				payeeWithHighestName,
			);
		});

		it("should focus the payee when the modal is closed", (): void => {
			payeeIndexController["editPayee"]();
			$uibModal.close(payee);
			expect(payeeIndexController["focusPayee"]).to.have.been.calledWith(
				payee.id,
			);
		});

		it("should not change the payees list when the modal is dismissed", (): void => {
			const originalPayees = angular.copy(payeeIndexController.payees);

			payeeIndexController["editPayee"]();
			$uibModal.dismiss();
			expect(payeeIndexController.payees).to.deep.equal(originalPayees);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			payeeIndexController["editPayee"]();
			$uibModal.close(payee);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			payeeIndexController["editPayee"]();
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("deletePayee", (): void => {
		let payee: Payee;

		beforeEach(
			(): Payee => (payee = angular.copy(payeeIndexController.payees[1])),
		);

		it("should fetch the payee", (): void => {
			payeeIndexController["deletePayee"](1);
			expect(payeeModel.find).to.have.been.calledWith(payee.id);
		});

		it("should disable navigation on the table", (): void => {
			payeeIndexController["deletePayee"](1);
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		it("should show an alert if the payee has transactions", (): void => {
			payeeIndexController["deletePayee"](2);
			expect($uibModal.open).to.have.been.called;
			expect(
				(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert)
					.header,
			).to.equal("Payee has existing transactions");
		});

		it("should show the delete payee modal if the payee has no transactions", (): void => {
			payeeIndexController["deletePayee"](1);
			expect($uibModal.open).to.have.been.called;
			expect(
				($uibModal.resolves as UibModalMockResolves).payee as Payee,
			).to.deep.equal(payee);
		});

		it("should remove the payee from the payees list when the modal is closed", (): void => {
			payeeIndexController["deletePayee"](1);
			$uibModal.close(payee);
			expect(payeeIndexController.payees).to.not.include(payee);
		});

		it("should transition to the payees list when the modal is closed", (): void => {
			payeeIndexController["deletePayee"](1);
			$uibModal.close(payee);
			expect($state.go).to.have.been.calledWith("root.payees");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			payeeIndexController["deletePayee"](1);
			$uibModal.close(payee);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			payeeIndexController["deletePayee"](1);
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("toggleFavourite", (): void => {
		let payee: Payee;

		beforeEach((): Payee[] => ([payee] = payeeIndexController.payees));

		it("should favourite the payee", (): void => {
			payee.favourite = false;
			payeeIndexController.toggleFavourite(0);
			expect(payee.favourite).to.be.true;
		});

		it("should unfavourite the payee", (): void => {
			payee.favourite = true;
			payeeIndexController.toggleFavourite(0);
			expect(payee.favourite).to.be.false;
		});

		afterEach(
			(): Chai.Assertion =>
				expect(payeeModel.toggleFavourite).to.have.been.called,
		);
	});

	describe("tableActions.selectAction", (): void => {
		it("should transition to the payee transactions list", (): void => {
			payeeIndexController.tableActions.selectAction();
			expect($state.go).to.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the payee", (): void => {
			sinon.stub(
				payeeIndexController,
				"editPayee" as keyof PayeeIndexController,
			);
			payeeIndexController.tableActions.editAction(1);
			expect(payeeIndexController["editPayee"]).to.have.been.calledWithExactly(
				1,
			);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a payee", (): void => {
			sinon.stub(
				payeeIndexController,
				"editPayee" as keyof PayeeIndexController,
			);
			payeeIndexController.tableActions.insertAction();
			expect(
				payeeIndexController["editPayee"],
			).to.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a payee", (): void => {
			sinon.stub(
				payeeIndexController,
				"deletePayee" as keyof PayeeIndexController,
			);
			payeeIndexController.tableActions.deleteAction(1);
			expect(
				payeeIndexController["deletePayee"],
			).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a payee when no payee is currently focussed", (): void => {
			payeeIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith(".payee", { id: 2 });
		});

		it("should focus a payee when another payee is currently focussed", (): void => {
			$state.currentState("**.payee");
			payeeIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith("^.payee", { id: 2 });
		});
	});

	describe("focusPayee", (): void => {
		beforeEach(
			(): SinonStub =>
				(payeeIndexController.tableActions.focusRow = sinon.stub()),
		);

		it("should do nothing when the specific payee row could not be found", (): void => {
			expect(payeeIndexController["focusPayee"](999)).to.be.NaN;
			expect(
				(payeeIndexController.tableActions as OgTableActionHandlers).focusRow,
			).to.not.have.been.called;
		});

		it("should focus the payee row for the specified payee", (): void => {
			const targetIndex: number = payeeIndexController["focusPayee"](1);

			$timeout.flush();
			expect(
				(payeeIndexController.tableActions as OgTableActionHandlers).focusRow,
			).to.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified payee", (): void => {
			const targetIndex: number = payeeIndexController["focusPayee"](1);

			expect(targetIndex).to.equal(0);
		});
	});
});
