describe("PayeeDeleteController", () => {
	let	payeeDeleteController,
			$uibModalInstance,
			payeeModel,
			payee;

	// Load the modules
	beforeEach(module("lootMocks", "lootPayees", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "payee"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$uibModalInstance_, _payeeModel_, _payee_) => {
		$uibModalInstance = _$uibModalInstance_;
		payeeModel = _payeeModel_;
		payee = _payee_;
		payeeDeleteController = controllerTest("PayeeDeleteController");
	}));

	it("should make the passed payee available to the view", () => payeeDeleteController.payee.should.deep.equal(payee));

	describe("deletePayee", () => {
		it("should reset any previous error messages", () => {
			payeeDeleteController.errorMessage = "error message";
			payeeDeleteController.deletePayee();
			(null === payeeDeleteController.errorMessage).should.be.true;
		});

		it("should delete the payee", () => {
			payeeDeleteController.deletePayee();
			payeeModel.destroy.should.have.been.calledWith(payee);
		});

		it("should close the modal when the payee delete is successful", () => {
			payeeDeleteController.deletePayee();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the payee delete is unsuccessful", () => {
			payeeDeleteController.payee.id = -1;
			payeeDeleteController.deletePayee();
			payeeDeleteController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			payeeDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
