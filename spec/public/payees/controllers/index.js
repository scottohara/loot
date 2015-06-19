describe("PayeeIndexController", () => {
	let	payeeIndexController,
			controllerTest,
			$timeout,
			$modal,
			$state,
			payeeModel,
			ogTableNavigableService,
			payees;

	// Load the modules
	beforeEach(module("lootMocks", "lootPayees", mockDependenciesProvider => mockDependenciesProvider.load(["$modal", "$state", "payeeModel", "payees"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$timeout_, _$modal_, _$state_, _payeeModel_, _ogTableNavigableService_, _payees_) => {
		controllerTest = _controllerTest_;
		$timeout = _$timeout_;
		$modal = _$modal_;
		$state = _$state_;
		payeeModel = _payeeModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		payees = _payees_;
		payeeIndexController = controllerTest("PayeeIndexController");
	}));

	it("should make the passed payees available to the view", () => payeeIndexController.payees.should.deep.equal(payees));

	describe("editPayee", () => {
		let payee;

		beforeEach(() => {
			sinon.stub(payeeIndexController, "focusPayee");
			payee = angular.copy(payeeIndexController.payees[1]);
		});

		it("should disable navigation on the table", () => {
			payeeIndexController.editPayee();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", () => {
			beforeEach(() => payeeIndexController.editPayee(1));

			it("should open the edit payee modal with a payee", () => {
				$modal.open.should.have.been.called;
				payeeModel.addRecent.should.have.been.calledWith(payee);
				$modal.resolves.payee.should.deep.equal(payee);
			});

			it("should update the payee in the list of payees when the modal is closed", () => {
				payee.name = "edited payee";
				$modal.close(payee);
				payeeIndexController.payees.should.include(payee);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				payee = {id: 999, name: "new payee"};
				payeeIndexController.editPayee();
			});

			it("should open the edit payee modal without a payee", () => {
				$modal.open.should.have.been.called;
				payeeModel.addRecent.should.not.have.been.called;
				(!$modal.resolves.payee).should.be.true;
			});

			it("should add the new payee to the list of payees when the modal is closed", () => {
				$modal.close(payee);
				payeeIndexController.payees.pop().should.deep.equal(payee);
			});

			it("should add the new payee to the recent list", () => {
				$modal.close(payee);
				payeeModel.addRecent.should.have.been.calledWith(payee);
			});
		});

		it("should resort the payees list when the modal is closed", () => {
			const payeeWithHighestName = angular.copy(payeeIndexController.payees[2]);

			payeeIndexController.editPayee();
			$modal.close(payee);
			payeeIndexController.payees.pop().should.deep.equal(payeeWithHighestName);
		});

		it("should focus the payee when the modal is closed", () => {
			payeeIndexController.editPayee();
			$modal.close(payee);
			payeeIndexController.focusPayee.should.have.been.calledWith(payee.id);
		});

		it("should not change the payees list when the modal is dismissed", () => {
			const originalPayees = angular.copy(payeeIndexController.payees);

			payeeIndexController.editPayee();
			$modal.dismiss();
			payeeIndexController.payees.should.deep.equal(originalPayees);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			payeeIndexController.editPayee();
			$modal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			payeeIndexController.editPayee();
			$modal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deletePayee", () => {
		let payee;

		beforeEach(() => payee = angular.copy(payeeIndexController.payees[1]));

		it("should fetch the payee", () => {
			payeeIndexController.deletePayee(1);
			payeeModel.find.should.have.been.calledWith(payee.id);
		});

		it("should disable navigation on the table", () => {
			payeeIndexController.deletePayee(1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should show an alert if the payee has transactions", () => {
			payeeIndexController.deletePayee(2);
			$modal.open.should.have.been.called;
			$modal.resolves.alert.header.should.equal("Payee has existing transactions");
		});

		it("should show the delete payee modal if the payee has no transactions", () => {
			payeeIndexController.deletePayee(1);
			$modal.open.should.have.been.called;
			$modal.resolves.payee.should.deep.equal(payee);
		});

		it("should remove the payee from the payees list when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$modal.close(payee);
			payeeIndexController.payees.should.not.include(payee);
		});

		it("should transition to the payees list when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$modal.close(payee);
			$state.go.should.have.been.calledWith("root.payees");
		});

		it("should enable navigation on the table when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$modal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			payeeIndexController.deletePayee(1);
			$modal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", () => {
		it("should transition to the payee transactions list", () => {
			payeeIndexController.tableActions.selectAction();
			$state.go.should.have.been.calledWith(".transactions");
		});
	});

	describe("tableActions.editAction", () => {
		it("should edit the payee", () => {
			sinon.stub(payeeIndexController, "editPayee");
			payeeIndexController.tableActions.editAction(1);
			payeeIndexController.editPayee.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", () => {
		it("should insert a payee", () => {
			sinon.stub(payeeIndexController, "editPayee");
			payeeIndexController.tableActions.insertAction();
			payeeIndexController.editPayee.should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", () => {
		it("should delete a payee", () => {
			sinon.stub(payeeIndexController, "deletePayee");
			payeeIndexController.tableActions.deleteAction(1);
			payeeIndexController.deletePayee.should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", () => {
		it("should focus a payee when no payee is currently focussed", () => {
			payeeIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".payee", {id: 2});
		});

		it("should focus a payee when another payee is currently focussed", () => {
			$state.currentState("**.payee");
			payeeIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.payee", {id: 2});
		});
	});

	describe("focusPayee", () => {
		beforeEach(() => payeeIndexController.tableActions.focusRow = sinon.stub());

		it("should do nothing when the specific payee row could not be found", () => {
			(!payeeIndexController.focusPayee(999)).should.be.true;
			payeeIndexController.tableActions.focusRow.should.not.have.been.called;
		});

		it("should focus the payee row for the specified payee", () => {
			const targetIndex = payeeIndexController.focusPayee(1);

			$timeout.flush();
			payeeIndexController.tableActions.focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified payee", () => {
			const targetIndex = payeeIndexController.focusPayee(1);

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
			sinon.stub(payeeIndexController, "focusPayee");
		});

		it("should do nothing when an id state parameter is not specified", () => {
			Reflect.deleteProperty(toParams, "id");
			payeeIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			payeeIndexController.focusPayee.should.not.have.been.called;
		});

		it("should do nothing when state parameters have not changed", () => {
			payeeIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			payeeIndexController.focusPayee.should.not.have.been.called;
		});

		it("should ensure the payee is focussed when the state name changes", () => {
			toState.name = "new state";
			payeeIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			payeeIndexController.focusPayee.should.have.been.calledWith(toParams.id);
		});

		it("should ensure the payee is focussed when the payee id state param changes", () => {
			toParams.id = 2;
			payeeIndexController.stateChangeSuccessHandler(null, toState, toParams, fromState, fromParams);
			payeeIndexController.focusPayee.should.have.been.calledWith(toParams.id);
		});
	});

	it("should attach a state change success handler", () => {
		sinon.stub(payeeIndexController, "stateChangeSuccessHandler");
		payeeIndexController.$scope.$emit("$stateChangeSuccess");
		payeeIndexController.stateChangeSuccessHandler.should.have.been.called;
	});
});
