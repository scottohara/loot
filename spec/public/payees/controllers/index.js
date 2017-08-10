describe("PayeeIndexController", () => {
	let	payeeIndexController,
			$transitions,
			$timeout,
			$uibModal,
			$state,
			payeeModel,
			ogTableNavigableService,
			payees,
			deregisterTransitionSuccessHook;

	// Load the modules
	beforeEach(module("lootMocks", "lootPayees", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "$state", "payeeModel", "payees"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$transitions_, _$timeout_, _$uibModal_, _$state_, _payeeModel_, _ogTableNavigableService_, _payees_) => {
		const controllerTest = _controllerTest_;

		$transitions = _$transitions_;
		$timeout = _$timeout_;
		$uibModal = _$uibModal_;
		$state = _$state_;
		payeeModel = _payeeModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		payees = _payees_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		payeeIndexController = controllerTest("PayeeIndexController");
	}));

	it("should make the passed payees available to the view", () => payeeIndexController.payees.should.deep.equal(payees));

	it("should register a success transition hook", () => $transitions.onSuccess.should.have.been.calledWith({to: "root.payees.payee"}, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", () => {
		payeeIndexController.$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the payee is focussed when the payee id state param changes", () => {
		const toParams = {id: "1"};

		sinon.stub(payeeIndexController, "focusPayee");
		$transitions.onSuccess.firstCall.args[1]({params: sinon.stub().withArgs("to").returns(toParams)});
		payeeIndexController.focusPayee.should.have.been.calledWith(Number(toParams.id));
	});

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
				$uibModal.open.should.have.been.called;
				payeeModel.addRecent.should.have.been.calledWith(payee);
				$uibModal.resolves.payee.should.deep.equal(payee);
			});

			it("should update the payee in the list of payees when the modal is closed", () => {
				payee.name = "edited payee";
				$uibModal.close(payee);
				payeeIndexController.payees.should.include(payee);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				payee = {id: 999, name: "new payee"};
				payeeIndexController.editPayee();
			});

			it("should open the edit payee modal without a payee", () => {
				$uibModal.open.should.have.been.called;
				payeeModel.addRecent.should.not.have.been.called;
				(!$uibModal.resolves.payee).should.be.true;
			});

			it("should add the new payee to the list of payees when the modal is closed", () => {
				$uibModal.close(payee);
				payeeIndexController.payees.pop().should.deep.equal(payee);
			});

			it("should add the new payee to the recent list", () => {
				$uibModal.close(payee);
				payeeModel.addRecent.should.have.been.calledWith(payee);
			});
		});

		it("should resort the payees list when the modal is closed", () => {
			const payeeWithHighestName = angular.copy(payeeIndexController.payees[2]);

			payeeIndexController.editPayee();
			$uibModal.close(payee);
			payeeIndexController.payees.pop().should.deep.equal(payeeWithHighestName);
		});

		it("should focus the payee when the modal is closed", () => {
			payeeIndexController.editPayee();
			$uibModal.close(payee);
			payeeIndexController.focusPayee.should.have.been.calledWith(payee.id);
		});

		it("should not change the payees list when the modal is dismissed", () => {
			const originalPayees = angular.copy(payeeIndexController.payees);

			payeeIndexController.editPayee();
			$uibModal.dismiss();
			payeeIndexController.payees.should.deep.equal(originalPayees);
		});

		it("should enable navigation on the table when the modal is closed", () => {
			payeeIndexController.editPayee();
			$uibModal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			payeeIndexController.editPayee();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("deletePayee", () => {
		let payee;

		beforeEach(() => (payee = angular.copy(payeeIndexController.payees[1])));

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
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.alert.header.should.equal("Payee has existing transactions");
		});

		it("should show the delete payee modal if the payee has no transactions", () => {
			payeeIndexController.deletePayee(1);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.payee.should.deep.equal(payee);
		});

		it("should remove the payee from the payees list when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			payeeIndexController.payees.should.not.include(payee);
		});

		it("should transition to the payees list when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			$state.go.should.have.been.calledWith("root.payees");
		});

		it("should enable navigation on the table when the modal is closed", () => {
			payeeIndexController.deletePayee(1);
			$uibModal.close(payee);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", () => {
			payeeIndexController.deletePayee(1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("toggleFavourite", () => {
		let payee;

		beforeEach(() => {
			[payee] = payeeIndexController.payees;
		});

		it("should favourite the payee", () => {
			payee.favourite = false;
			payeeIndexController.toggleFavourite(0);
			payee.favourite.should.be.true;
		});

		it("should unfavourite the payee", () => {
			payee.favourite = true;
			payeeIndexController.toggleFavourite(0);
			payee.favourite.should.be.false;
		});

		afterEach(() => payeeModel.toggleFavourite.should.have.been.called);
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
		beforeEach(() => (payeeIndexController.tableActions.focusRow = sinon.stub()));

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
});
