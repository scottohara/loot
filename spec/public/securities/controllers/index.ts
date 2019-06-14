import {
	StateMock,
	UibModalMock,
	UibModalMockResolves
} from "mocks/node-modules/angular/types";
import sinon, {SinonStub} from "sinon";
import {ControllerTestFactory} from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {OgModalAlert} from "og-components/og-modal-alert/types";
import {OgTableActionHandlers} from "og-components/og-table-navigable/types";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import {Security} from "securities/types";
import SecurityIndexController from "securities/controllers";
import {SecurityModelMock} from "mocks/securities/types";
import angular from "angular";
import createSecurity from "mocks/securities/factories";

describe("SecurityIndexController", (): void => {
	let	securityIndexController: SecurityIndexController,
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
	beforeEach(angular.mock.module("lootMocks", "lootSecurities", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "$state", "securityModel", "securities"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$transitions_: angular.ui.IStateParamsService, _$timeout_: angular.ITimeoutService, _$uibModal_: UibModalMock, _$state_: StateMock, _securityModel_: SecurityModelMock, _ogTableNavigableService_: OgTableNavigableService, _securities_: Security[]): void => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		securityModel = _securityModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		securities = _securities_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		securityIndexController = controllerTest("SecurityIndexController") as SecurityIndexController;
	}));

	it("should make the passed securities available to the view", (): Chai.Assertion => securityIndexController.securities.should.deep.equal(securities));

	it("should return the sum of all security values, to 2 decimal places", (): Chai.Assertion => securityIndexController.totalValue.should.equal(45.01));

	it("should focus the security when a security id is specified", (): void => {
		$state.params.id = "1";
		securityIndexController = controllerTest("SecurityIndexController", {$state}) as SecurityIndexController;
		securityIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		(securityIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(0);
	});

	it("should not focus the security when a security id is not specified", (): void =>	$timeout.verifyNoPendingTasks());

	it("should register a success transition hook", (): Chai.Assertion => $transitions.onSuccess.should.have.been.calledWith({to: "root.securities.security"}, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(securityIndexController as angular.IController).$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the security is focussed when the security id state param changes", (): void => {
		const toParams: {id: string;} = {id: "1"};

		sinon.stub(securityIndexController, "focusSecurity" as keyof SecurityIndexController);
		$transitions.onSuccess.firstCall.args[1]({params: sinon.stub().withArgs("to").returns(toParams)});
		securityIndexController["focusSecurity"].should.have.been.calledWith(Number(toParams.id));
	});

	describe("editSecurity", (): void => {
		let security: Security;

		beforeEach((): void => {
			sinon.stub(securityIndexController, "focusSecurity" as keyof SecurityIndexController);
			security = angular.copy(securityIndexController.securities[1]);
		});

		it("should disable navigation on the table", (): void => {
			securityIndexController.editSecurity();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void => securityIndexController.editSecurity(1));

			it("should open the edit security modal with a security", (): void => {
				$uibModal.open.should.have.been.called;
				securityModel.addRecent.should.have.been.calledWith(security);
				(($uibModal.resolves as UibModalMockResolves).security as Security).should.deep.equal(security);
			});

			it("should update the security in the list of securities when the modal is closed", (): void => {
				security.name = "edited security";
				$uibModal.close(security);
				securityIndexController.securities.should.include(security);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				security = createSecurity({id: 999, unused: true});
				securityIndexController.editSecurity();
			});

			it("should open the edit security modal without a security", (): void => {
				$uibModal.open.should.have.been.called;
				securityModel.addRecent.should.not.have.been.called;
				(!($uibModal.resolves as UibModalMockResolves).security).should.be.true;
			});

			it("should add the new security to the list of securities when the modal is closed", (): void => {
				$uibModal.close(security);
				(securityIndexController.securities.pop() as Security).should.deep.equal(security);
			});

			it("should add the new security to the recent list", (): void => {
				$uibModal.close(security);
				securityModel.addRecent.should.have.been.calledWith(security);
			});
		});

		it("should resort the securities list when the modal is closed", (): void => {
			const securityWithNoHoldingAndHighestName = angular.copy(securityIndexController.securities[6]);

			securityIndexController.editSecurity();
			$uibModal.close(security);
			(securityIndexController.securities.pop() as Security).should.deep.equal(securityWithNoHoldingAndHighestName);
		});

		it("should focus the security when the modal is closed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			securityIndexController["focusSecurity"].should.have.been.calledWith(security.id);
		});

		it("should not change the securities list when the modal is dismissed", (): void => {
			const originalSecurities: Security[] = angular.copy(securityIndexController.securities);

			securityIndexController.editSecurity();
			$uibModal.dismiss();
			securityIndexController.securities.should.deep.equal(originalSecurities);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			securityIndexController.editSecurity();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deleteSecurity", (): void => {
		let security: Security;

		beforeEach((): Security => (security = angular.copy(securityIndexController.securities[1])));

		it("should fetch the security", (): void => {
			securityIndexController.deleteSecurity(1);
			securityModel.find.should.have.been.calledWith(security.id);
		});

		it("should disable navigation on the table", (): void => {
			securityIndexController.deleteSecurity(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should show an alert if the security has transactions", (): void => {
			securityIndexController.deleteSecurity(2);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert).header.should.equal("Security has existing transactions");
		});

		it("should show the delete security modal if the security has no transactions", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).security as Security).should.deep.equal(security);
		});

		it("should remove the security from the securities list when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			securityIndexController.securities.should.not.include(security);
		});

		it("should transition to the securities list when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			$state.go.should.have.been.calledWith("root.securities");
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			securityIndexController.deleteSecurity(1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("toggleFavourite", (): void => {
		let security: Security;

		beforeEach((): Security[] => ([security] = securityIndexController.securities));

		it("should favourite the security", (): void => {
			security.favourite = false;
			securityIndexController.toggleFavourite(0);
			security.favourite.should.be.true;
		});

		it("should unfavourite the security", (): void => {
			security.favourite = true;
			securityIndexController.toggleFavourite(0);
			security.favourite.should.be.false;
		});

		afterEach((): Chai.Assertion => securityModel.toggleFavourite.should.have.been.called);
	});

	describe("tableActions.selectAction", (): void => {
		it("should transition to the security transactions list", (): void => {
			securityIndexController.tableActions.selectAction();
			$state.go.should.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the security", (): void => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.editAction(1);
			securityIndexController.editSecurity.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a security", (): void => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.insertAction();
			securityIndexController.editSecurity.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a security", (): void => {
			sinon.stub(securityIndexController, "deleteSecurity");
			securityIndexController.tableActions.deleteAction(1);
			securityIndexController.deleteSecurity.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a security when no security is currently focussed", (): void => {
			securityIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".security", {id: 2});
		});

		it("should focus a security when another security is currently focussed", (): void => {
			$state.currentState("**.security");
			securityIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.security", {id: 2});
		});
	});

	describe("focusSecurity", (): void => {
		beforeEach((): SinonStub => (securityIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific security row could not be found", (): void => {
			(!securityIndexController["focusSecurity"](999)).should.be.true;
			(securityIndexController.tableActions as OgTableActionHandlers).focusRow.should.not.have.been.called;
		});

		it("should focus the security row for the specified security", (): void => {
			const targetIndex: number = securityIndexController["focusSecurity"](1);

			$timeout.flush();
			(securityIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified security", (): void => {
			const targetIndex: number = securityIndexController["focusSecurity"](1);

			targetIndex.should.equal(0);
		});
	});
});
