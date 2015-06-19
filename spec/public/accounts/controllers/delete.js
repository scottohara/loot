describe("AccountDeleteController", () => {
	let accountDeleteController,
			$modalInstance,
			accountModel,
			account;

	// Load the modules
	beforeEach(module("lootMocks", "lootAccounts", mockDependenciesProvider => mockDependenciesProvider.load(["$modalInstance", "accountModel", "account"])));

	// Configure & compile the object under test
	beforeEach(inject((controllerTest, _$modalInstance_, _accountModel_, _account_) => {
		$modalInstance = _$modalInstance_;
		accountModel = _accountModel_;
		account = _account_;
		accountDeleteController = controllerTest("AccountDeleteController");
	}));

	it("should make the passed account available to the view", () => {
		account.account_type = `${account.account_type.charAt(0).toUpperCase()}${account.account_type.substr(1)}`;
		account.status = `${account.status.charAt(0).toUpperCase()}${account.status.substr(1)}`;
		accountDeleteController.account.should.deep.equal(account);
	});

	it("should capitalise the account type", () => accountDeleteController.account.account_type.should.equal("Bank"));

	it("should capitalise the status", () => accountDeleteController.account.status.should.equal("Open"));

	describe("deleteAccount", () => {
		it("should reset any previous error messages", () => {
			accountDeleteController.errorMessage = "error message";
			accountDeleteController.deleteAccount();
			(null === accountDeleteController.errorMessage).should.be.true;
		});

		it("should delete the account", () => {
			accountDeleteController.deleteAccount();
			accountModel.destroy.should.have.been.calledWith(account);
		});

		it("should close the modal when the account delete is successful", () => {
			accountDeleteController.deleteAccount();
			$modalInstance.close.should.have.been.called;
		});

		it("should display an error message when the account delete is unsuccessful", () => {
			accountDeleteController.account.id = -1;
			accountDeleteController.deleteAccount();
			accountDeleteController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			accountDeleteController.cancel();
			$modalInstance.dismiss.should.have.been.called;
		});
	});
});
