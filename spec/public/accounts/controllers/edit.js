describe("AccountEditController", () => {
	let accountEditController,
			controllerTest,
			$modalInstance,
			accountModel,
			account;

	// Load the modules
	beforeEach(module("lootMocks", "lootAccounts", mockDependenciesProvider => mockDependenciesProvider.load(["$modalInstance", "accountModel", "account"])));

	// Configure & compile the object under test
	beforeEach(inject((_controllerTest_, _$modalInstance_, _accountModel_, _account_) => {
		controllerTest = _controllerTest_;
		$modalInstance = _$modalInstance_;
		accountModel = _accountModel_;
		account = _account_;
		accountEditController = controllerTest("AccountEditController");
	}));

	describe("when an account is provided", () => {
		it("should make the passed account available to the view", () => {
			account.account_type = `${account.account_type.charAt(0).toUpperCase()}${account.account_type.substr(1)}`;
			account.status = `${account.status.charAt(0).toUpperCase()}${account.status.substr(1)}`;
			accountEditController.account.should.deep.equal(account);
		});

		it("should set the mode to Edit", () => accountEditController.mode.should.equal("Edit"));

		it("should capitalise the account type", () => accountEditController.account.account_type.should.equal("Bank"));

		it("should capitalise the status", () => accountEditController.account.status.should.equal("Open"));
	});

	describe("when an account is not provided", () => {
		beforeEach(() => accountEditController = controllerTest("AccountEditController", {account: null}));

		it("should make an empty account object available to the view", () => accountEditController.account.should.deep.equal({opening_balance: 0}));

		it("should set the mode to Add", () => accountEditController.mode.should.equal("Add"));
	});

	describe("accountTypes", () => {
		it("should return a filtered & limited list of account types", () => accountEditController.accountTypes("t", 2).should.deep.equal(["Asset", "Credit"]));
	});

	describe("accountTypeSelected", () => {
		it("should reset the related account if the account type is investment", () => {
			accountEditController.account.account_type = "Investment";
			accountEditController.account.related_account = "related account";
			accountEditController.accountTypeSelected();
			accountEditController.account.related_account.should.deep.equal({opening_balance: 0});
		});

		it("should clear the related account if the account type is not investment", () => {
			accountEditController.account.related_account = "related account";
			accountEditController.accountTypeSelected();
			(null === accountEditController.account.related_account).should.be.true;
		});
	});

	describe("accounts", () => {
		it("should fetch the list of accounts", () => {
			accountEditController.accounts();
			accountModel.all.should.have.been.called;
		});

		it("should return a filtered & limited list of asset accounts", () => {
			accountEditController.accounts("b", 2).should.eventually.deep.equal([
				{id: 4, name: "ba", account_type: "asset"},
				{id: 5, name: "ab", account_type: "asset"}
			]);
		});
	});

	describe("save", () => {
		it("should reset any previous error messages", () => {
			accountEditController.errorMessage = "error message";
			accountEditController.save();
			(null === accountEditController.errorMessage).should.be.true;
		});

		it("should convert the account type to lower case", () => {
			accountEditController.save();
			accountEditController.account.account_type.should.equal("bank");
		});

		it("should convert the status to lower case", () => {
			accountEditController.save();
			accountEditController.account.status.should.equal("open");
		});

		it("should save the account", () => {
			accountEditController.save();
			accountModel.save.should.have.been.calledWith(account);
		});

		it("should close the modal when the account save is successful", () => {
			accountEditController.save();
			$modalInstance.close.should.have.been.calledWith(account);
		});

		it("should display an error message when the account save is unsuccessful", () => {
			accountEditController.account.id = -1;
			accountEditController.save();
			accountEditController.errorMessage.should.equal("unsuccessful");
		});
	});

	describe("cancel", () => {
		it("should dismiss the modal", () => {
			accountEditController.cancel();
			$modalInstance.dismiss.should.have.been.called;
		});
	});
});
