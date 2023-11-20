import type {
	StateMock,
	UibModalMock,
	UibModalMockResolves,
} from "~/mocks/node-modules/angular/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type { OgTableActionHandlers } from "~/og-components/og-table-navigable/types";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type { Security } from "~/securities/types";
import type SecurityIndexController from "~/securities/controllers";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type { SinonStub } from "sinon";
import angular from "angular";
import createSecurity from "~/mocks/securities/factories";
import sinon from "sinon";

describe("SecurityIndexController", (): void => {
	let securityIndexController: SecurityIndexController,
		controllerTest: ControllerTestFactory,
		$transitions: angular.ui.IStateParamsService,
		$timeout: angular.ITimeoutService,
		$uibModal: UibModalMock,
		$state: StateMock,
		securityModel: SecurityModelMock,
		ogTableNavigableService: OgTableNavigableService,
		securities: Security[],
		deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootSecurities",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModal",
					"$state",
					"securityModel",
					"securities",
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
				_securityModel_: SecurityModelMock,
				_ogTableNavigableService_: OgTableNavigableService,
				_securities_: Security[],
			): void => {
				controllerTest = _controllerTest_;
				$transitions = _$transitions_;
				$timeout = _$timeout_;
				$uibModal = _$uibModal_;
				$state = _$state_;
				securityModel = _securityModel_;
				ogTableNavigableService = _ogTableNavigableService_;
				securities = _securities_;
				deregisterTransitionSuccessHook = sinon.stub();
				sinon
					.stub($transitions, "onSuccess")
					.returns(deregisterTransitionSuccessHook);
				securityIndexController = controllerTest(
					"SecurityIndexController",
				) as SecurityIndexController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed securities available to the view", (): Chai.Assertion =>
		expect(securityIndexController.securities).to.deep.equal(securities));

	it("should return the sum of all security values, to 2 decimal places", (): Chai.Assertion =>
		expect(securityIndexController.totalValue).to.equal(45.01));

	it("should focus the security when a security id is specified", (): void => {
		$state.params.id = "1";
		securityIndexController = controllerTest("SecurityIndexController", {
			$state,
		}) as SecurityIndexController;
		securityIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		expect(
			(securityIndexController.tableActions as OgTableActionHandlers).focusRow,
		).to.have.been.calledWith(0);
	});

	it("should not focus the security when a security id is not specified", (): void =>
		$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion =>
		expect($transitions.onSuccess).to.have.been.calledWith(
			{ to: "root.securities.security" },
			sinon.match.func,
		));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(securityIndexController as angular.IController).$scope.$emit("$destroy");
		expect(deregisterTransitionSuccessHook).to.have.been.called;
	});

	it("should ensure the security is focussed when the security id state param changes", (): void => {
		const toParams: { id: string } = { id: "1" };

		sinon.stub(
			securityIndexController,
			"focusSecurity" as keyof SecurityIndexController,
		);
		$transitions.onSuccess.firstCall.args[1]({
			params: sinon.stub().withArgs("to").returns(toParams),
		});
		expect(securityIndexController["focusSecurity"]).to.have.been.calledWith(
			Number(toParams.id),
		);
	});

	describe("editSecurity", (): void => {
		let security: Security;

		beforeEach((): void => {
			sinon.stub(
				securityIndexController,
				"focusSecurity" as keyof SecurityIndexController,
			);
			security = angular.copy(securityIndexController.securities[1]);
		});

		it("should disable navigation on the table", (): void => {
			securityIndexController.editSecurity();
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void => securityIndexController.editSecurity(1));

			it("should open the edit security modal with a security", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(securityModel.addRecent).to.have.been.calledWith(security);
				expect(
					($uibModal.resolves as UibModalMockResolves).security as Security,
				).to.deep.equal(security);
			});

			it("should update the security in the list of securities when the modal is closed", (): void => {
				security.name = "edited security";
				$uibModal.close(security);
				expect(securityIndexController.securities).to.include(security);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				security = createSecurity({ id: 999, unused: true });
				securityIndexController.editSecurity();
			});

			it("should open the edit security modal without a security", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(securityModel.addRecent).to.not.have.been.called;
				expect(($uibModal.resolves as UibModalMockResolves).security).to.be
					.undefined;
			});

			it("should add the new security to the list of securities when the modal is closed", (): void => {
				$uibModal.close(security);
				expect(
					securityIndexController.securities.pop() as Security,
				).to.deep.equal(security);
			});

			it("should add the new security to the recent list", (): void => {
				$uibModal.close(security);
				expect(securityModel.addRecent).to.have.been.calledWith(security);
			});
		});

		it("should resort the securities list when the modal is closed", (): void => {
			const securityWithNoHoldingAndHighestName = angular.copy(
				securityIndexController.securities[6],
			);

			securityIndexController.editSecurity();
			$uibModal.close(security);
			expect(
				securityIndexController.securities.pop() as Security,
			).to.deep.equal(securityWithNoHoldingAndHighestName);
		});

		it("should focus the security when the modal is closed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			expect(securityIndexController["focusSecurity"]).to.have.been.calledWith(
				security.id,
			);
		});

		it("should not change the securities list when the modal is dismissed", (): void => {
			const originalSecurities: Security[] = angular.copy(
				securityIndexController.securities,
			);

			securityIndexController.editSecurity();
			$uibModal.dismiss();
			expect(securityIndexController.securities).to.deep.equal(
				originalSecurities,
			);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("deleteSecurity", (): void => {
		let security: Security;

		beforeEach(
			(): Security =>
				(security = angular.copy(securityIndexController.securities[1])),
		);

		it("should fetch the security", (): void => {
			securityIndexController.deleteSecurity(1);
			expect(securityModel.find).to.have.been.calledWith(security.id);
		});

		it("should disable navigation on the table", (): void => {
			securityIndexController.deleteSecurity(1);
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		it("should show an alert if the security has transactions", (): void => {
			securityIndexController.deleteSecurity(2);
			expect($uibModal.open).to.have.been.called;
			expect(
				(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert)
					.header,
			).to.equal("Security has existing transactions");
		});

		it("should show the delete security modal if the security has no transactions", (): void => {
			securityIndexController.deleteSecurity(1);
			expect($uibModal.open).to.have.been.called;
			expect(
				($uibModal.resolves as UibModalMockResolves).security as Security,
			).to.deep.equal(security);
		});

		it("should remove the security from the securities list when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			expect(securityIndexController.securities).to.not.include(security);
		});

		it("should transition to the securities list when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			expect($state.go).to.have.been.calledWith("root.securities");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("toggleFavourite", (): void => {
		let security: Security;

		beforeEach(
			(): Security[] => ([security] = securityIndexController.securities),
		);

		it("should favourite the security", (): void => {
			security.favourite = false;
			securityIndexController.toggleFavourite(0);
			expect(security.favourite).to.be.true;
		});

		it("should unfavourite the security", (): void => {
			security.favourite = true;
			securityIndexController.toggleFavourite(0);
			expect(security.favourite).to.be.false;
		});

		afterEach(
			(): Chai.Assertion =>
				expect(securityModel.toggleFavourite).to.have.been.called,
		);
	});

	describe("tableActions.selectAction", (): void => {
		it("should transition to the security transactions list", (): void => {
			securityIndexController.tableActions.selectAction();
			expect($state.go).to.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the security", (): void => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.editAction(1);
			expect(
				securityIndexController["editSecurity"],
			).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a security", (): void => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.insertAction();
			expect(
				securityIndexController["editSecurity"],
			).to.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a security", (): void => {
			sinon.stub(securityIndexController, "deleteSecurity");
			securityIndexController.tableActions.deleteAction(1);
			expect(
				securityIndexController["deleteSecurity"],
			).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a security when no security is currently focussed", (): void => {
			securityIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith(".security", { id: 2 });
		});

		it("should focus a security when another security is currently focussed", (): void => {
			$state.currentState("**.security");
			securityIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith("^.security", { id: 2 });
		});
	});

	describe("focusSecurity", (): void => {
		beforeEach(
			(): SinonStub =>
				(securityIndexController.tableActions.focusRow = sinon.stub()),
		);

		it("should do nothing when the specific security row could not be found", (): void => {
			expect(securityIndexController["focusSecurity"](999)).to.be.NaN;
			expect(
				(securityIndexController.tableActions as OgTableActionHandlers)
					.focusRow,
			).to.not.have.been.called;
		});

		it("should focus the security row for the specified security", (): void => {
			const targetIndex: number = securityIndexController["focusSecurity"](1);

			$timeout.flush();
			expect(
				(securityIndexController.tableActions as OgTableActionHandlers)
					.focusRow,
			).to.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified security", (): void => {
			const targetIndex: number = securityIndexController["focusSecurity"](1);

			expect(targetIndex).to.equal(0);
		});
	});
});
