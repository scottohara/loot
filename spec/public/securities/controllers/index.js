describe("SecurityIndexController", () => {
	let	securityIndexController,
			$timeout,
			$uibModal,
			$state,
			securityModel,
			ogTableNavigableService,
			securities;

	// Load the modules
	beforeEach(module("lootMocks", "lootSecurities", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "$state", "securityModel", "securities"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$timeout_, _$uibModal_, _$state_, _securityModel_, _ogTableNavigableService_, _securities_) => {
		const controllerTest = _controllerTest_;

		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		securityModel = _securityModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		securities = _securities_;
		securityIndexController = controllerTest("SecurityIndexController");
	}));

	it("should make the passed securities available to the view", () => securityIndexController.securities.should.deep.equal(securities));

	it("should return the sum of all security values, to 2 decimal places", () => securityIndexController.totalValue.should.equal(45.01));

	describe("editSecurity", () => {
		let security;

		beforeEach(() => {
			sinon.stub(securityIndexController, "focusSecurity");
			security = angular.copy(securityIndexController.securities[1]);
		});

		it("should disable navigation on the table", () => {
			securityIndexController.editSecurity();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", () => {
			beforeEach(() => securityIndexController.editSecurity(1));

			it("should open the edit security modal with a security", () => {
				$uibModal.open.should.have.been.called;
				securityModel.addRecent.should.have.been.calledWith(security);
				$uibModal.resolves.security.should.deep.equal(security);
			});

			it("should update the security in the list of securities when the modal is closed", () => {
				security.name = "edited security";
				$uibModal.close(security);
				securityIndexController.securities.should.include(security);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				security = {id: 999, name: "new security", current_holding: 0};
				securityIndexController.editSecurity();
			});

			it("should open the edit security modal without a security", () => {
				$uibModal.open.should.have.been.called;
				securityModel.addRecent.should.not.have.been.called;
				(!$uibModal.resolves.security).should.be.true;
			});

			it("should add the new security to the list of securities when the modal is closed", () => {
				$uibModal.close(security);
				securityIndexController.securities.pop().should.deep.equal(security);
			});

			it("should add the new security to the recent list", () => {
				$uibModal.close(security);
				securityModel.addRecent.should.have.been.calledWith(security);
			});
		});

		it("should resort the securities list when the modal is closed", () => {
			const securityWithNoHoldingAndHighestName = angular.copy(securityIndexController.securities[6]);

			securityIndexController.editSecurity();
			$uibModal.close(security);
			securityIndexController.securities.pop().should.deep.equal(securityWithNoHoldingAndHighestName);
		});

		it("should focus the security when the modal is closed", () => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			securityIndexController.focusSecurity.should.have.been.calledWith(security.id);
		});

		it("should not change the securities list when the modal is dismissed", () => {
			const originalSecurities = angular.copy(securityIndexController.securities);

			securityIndexController.editSecurity();
			$uibModal.dismiss();
			securityIndexController.securities.should.deep.equal(originalSecurities);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			securityIndexController.editSecurity();
			$uibModal.close(security);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			securityIndexController.editSecurity();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deleteSecurity", () => {
		let security;

		beforeEach(() => security = angular.copy(securityIndexController.securities[1]));

		it("should fetch the security", () => {
			securityIndexController.deleteSecurity(1);
			securityModel.find.should.have.been.calledWith(security.id);
		});

		it("should disable navigation on the table", () => {
			securityIndexController.deleteSecurity(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should show an alert if the security has transactions", () => {
			securityIndexController.deleteSecurity(2);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.alert.header.should.equal("Security has existing transactions");
		});

		it("should show the delete security modal if the security has no transactions", () => {
			securityIndexController.deleteSecurity(1);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.security.should.deep.equal(security);
		});

		it("should remove the security from the securities list when the modal is closed", () => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			securityIndexController.securities.should.not.include(security);
		});

		it("should transition to the securities list when the modal is closed", () => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			$state.go.should.have.been.calledWith("root.securities");
		});

		it("should enable navigation on the table when the modal is closed", () => {
			securityIndexController.deleteSecurity(1);
			$uibModal.close(security);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			securityIndexController.deleteSecurity(1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", () => {
		it("should transition to the security transactions list", () => {
			securityIndexController.tableActions.selectAction();
			$state.go.should.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", () => {
		it("should edit the security", () => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.editAction(1);
			securityIndexController.editSecurity.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", () => {
		it("should insert a security", () => {
			sinon.stub(securityIndexController, "editSecurity");
			securityIndexController.tableActions.insertAction();
			securityIndexController.editSecurity.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", () => {
		it("should delete a security", () => {
			sinon.stub(securityIndexController, "deleteSecurity");
			securityIndexController.tableActions.deleteAction(1);
			securityIndexController.deleteSecurity.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", () => {
		it("should focus a security when no security is currently focussed", () => {
			securityIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".security", {id: 2});
		});

		it("should focus a security when another security is currently focussed", () => {
			$state.currentState("**.security");
			securityIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.security", {id: 2});
		});
	});

	describe("focusSecurity", () => {
		beforeEach(() => securityIndexController.tableActions.focusRow = sinon.stub());

		it("should do nothing when the specific security row could not be found", () => {
			(!securityIndexController.focusSecurity(999)).should.be.true;
			securityIndexController.tableActions.focusRow.should.not.have.been.called;
		});

		it("should focus the security row for the specified security", () => {
			const targetIndex = securityIndexController.focusSecurity(1);

			$timeout.flush();
			securityIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified security", () => {
			const targetIndex = securityIndexController.focusSecurity(1);

			targetIndex.should.equal(0);
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
			sinon.stub(securityIndexController, "focusSecurity");
		});

		it("should do nothing when an id state parameter is not specified", () => {
			Reflect.deleteProperty(toParams, "id");
			securityIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			securityIndexController.focusSecurity.should.not.have.been.called;
		});

		it("should do nothing when state parameters have not changed", () => {
			securityIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			securityIndexController.focusSecurity.should.not.have.been.called;
		});

		it("should ensure the security is focussed when the state name changes", () => {
			toState.name = "new state";
			securityIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			securityIndexController.focusSecurity.should.have.been.calledWith(toParams.id);
		});

		it("should ensure the security is focussed when the security id state param changes", () => {
			toParams.id = 2;
			securityIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			securityIndexController.focusSecurity.should.have.been.calledWith(toParams.id);
		});
	});

	it("should attach a state change success handler", () => {
		sinon.stub(securityIndexController, "stateChangeSuccessHandler");
		securityIndexController.$scope.$emit("$stateChangeSuccess");
		securityIndexController.stateChangeSuccessHandler.should.have.been.called;
	});
});
