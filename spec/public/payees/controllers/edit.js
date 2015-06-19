describe("PayeeEditController", () => {
	let	payeeEditController,
			controllerTest,
			$modalInstance,
			payeeModel,
			payee;

	// Load the modules
	beforeEach(module("lootMocks", "lootPayees", mockDependenciesProvider => mockDependenciesProvider.load(["$modalInstance", "payeeModel", "payee"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$modalInstance_, _payeeModel_, _payee_) => {
		controllerTest = _controllerTest_;
		$modalInstance = _$modalInstance_;
		payeeModel = _payeeModel_;
		payee = _payee_;
		payeeEditController = controllerTest("PayeeEditController");
	}));

	describe("when a payee is provided", () => {
		it("should make the passed payee available to the view", () => payeeEditController.payee.should.deep.equal(payee));

		it("should set the mode to Edit", () => payeeEditController.mode.should.equal("Edit"));
	});

	describe("when a payee is not provided", () => {
		beforeEach(() => payeeEditController = controllerTest("PayeeEditController", {payee: null}));

		it("should make an empty payee object available to the view", () => {
			payeeEditController.payee.should.be.an.Object;
			payeeEditController.payee.should.be.empty;
		});

		it("should set the mode to Add", () => payeeEditController.mode.should.equal("Add"));
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			payeeEditController.errorMessage = "error message";
			payeeEditController.save();
			(null === payeeEditController.errorMessage).should.be.true;
		});

		it("should save the payee", () => {
			payeeEditController.save();
			payeeModel.save.should.have.been.calledWith(payee);
		});

		it("should close the modal when the payee save is successful", () => {
			payeeEditController.save();
			$modalInstance.close.should.have.been.calledWith(payee);
		});

		it("should display an error message when the payee save is unsuccessful", () => {
			payeeEditController.payee.id = -1;
			payeeEditController.save();
			payeeEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			payeeEditController.cancel();
			$modalInstance.dismiss.should.have.been.called;
		});
	});
});
