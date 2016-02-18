describe("AccountReconcileController", () => {
	let accountReconcileController,
			controllerTest,
			$uibModalInstance,
			$window,
			account;

	// Load the modules
	beforeEach(module("lootMocks", "lootAccounts", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModalInstance", "$window", "account"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$uibModalInstance_, _$window_, _account_) => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		$window = _$window_;
		account = _account_;
		accountReconcileController = controllerTest("AccountReconcileController");
	}));

	it("should fetch the closing balance from localStorage and make it available to the view", () => {
		$window.localStorage.getItem.should.have.been.calledWith("lootClosingBalance-1");
		accountReconcileController.closingBalance.should.equal(1000);
	});

	it("should expect a postive closing balance to be entered by the user", () => accountReconcileController.expectNegativeBalance.should.be.false);

	["credit", "loan"].forEach(accountType => {
		it(`should expect a negative closing balance to be entered by the user for ${accountType} accounts`, () => {
			account.account_type = accountType;
			accountReconcileController = controllerTest("AccountReconcileController", {account});
			accountReconcileController.expectNegativeBalance.should.be.true;
		});
	});

	describe("start", () => {
		it("should save the closing balance to localStorage", () => {
			accountReconcileController.start();
			$window.localStorage.setItem.should.have.been.calledWith("lootClosingBalance-1", 1000);
		});

		it("should close the modal when the transaction delete is successful", () => {
			accountReconcileController.start();
			$uibModalInstance.close.should.have.been.calledWith(1000);
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			accountReconcileController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
