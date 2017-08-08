describe("AccountIndexController", () => {
	let accountIndexController,
			$uibModal,
			accountModel,
			accountsWithBalances;

	// Load the modules
	beforeEach(module("lootMocks", "lootAccounts", mockDependenciesProvider => mockDependenciesProvider.load(["$uibModal", "accountModel", "accountsWithBalances"])));

	// Configure & compile the object under test
	beforeEach(inject((_$uibModal_, controllerTest, _accountModel_, _accountsWithBalances_) => {
		$uibModal = _$uibModal_;
		accountModel = _accountModel_;
		accountsWithBalances = _accountsWithBalances_;
		accountIndexController = controllerTest("AccountIndexController", {accounts: accountsWithBalances});
	}));

	it("should make the account list available to the view", () => accountIndexController.accounts.should.equal(accountsWithBalances));

	it("should calculate the net worth by summing the account type totals", () => accountIndexController.netWorth.should.equal(200));

	describe("editAccount", () => {
		let account;

		beforeEach(() => {
			account = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[1]);
			sinon.stub(accountIndexController, "calculateAccountTypeTotal");
		});

		describe("(edit existing)", () => {
			beforeEach(() => accountIndexController.editAccount("Bank accounts", 1));

			it("should open the edit account modal with an account", () => {
				$uibModal.open.should.have.been.called;
				accountModel.addRecent.should.have.been.calledWith(account);
				$uibModal.resolves.account.should.deep.equal(account);
			});

			describe("(account type changed)", () => {
				beforeEach(() => {
					account.account_type = "investment";
					$uibModal.close(account);
				});

				it("should remove the account from original account type's list", () => accountIndexController.accounts["Bank accounts"].accounts.should.not.include(account));

				it("should recalculate the original account type total", () => accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts"));

				it("should add the account to the new account type's list", () => accountIndexController.accounts["Investment accounts"].accounts.should.include(account));
			});

			it("should update the account in the list of accounts when the modal is closed", () => {
				account.name = "edited account";
				$uibModal.close(account);
				accountIndexController.accounts["Bank accounts"].accounts.should.include(account);
			});
		});

		describe("(add new)", () => {
			beforeEach(() => {
				account = {id: 999, name: "new account", account_type: "bank"};
				accountIndexController.editAccount();
			});

			it("should open the edit account modal without an account", () => {
				$uibModal.open.should.have.been.called;
				accountModel.addRecent.should.not.have.been.called;
				(!$uibModal.resolves.account).should.be.true;
			});

			it("should add the new account to the list of accounts when the modal is closed", () => {
				$uibModal.close(account);
				accountIndexController.accounts["Bank accounts"].accounts.pop().should.deep.equal(account);
			});

			it("should add the new account to the recent list", () => {
				$uibModal.close(account);
				accountModel.addRecent.should.have.been.calledWith(account);
			});
		});

		it("should resort the accounts list when the modal is closed", () => {
			const accountWithHighestName = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[2]);

			accountIndexController.editAccount();
			$uibModal.close(account);
			accountIndexController.accounts["Bank accounts"].accounts.pop().should.deep.equal(accountWithHighestName);
		});

		it("should recalculate the account type total when the modal is closed", () => {
			accountIndexController.editAccount();
			$uibModal.close(account);
			accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts");
		});

		it("should not change the accounts list when the modal is dismissed", () => {
			const originalAccounts = angular.copy(accountIndexController.accounts);

			accountIndexController.editAccount();
			$uibModal.dismiss();
			accountIndexController.accounts.should.deep.equal(originalAccounts);
		});
	});

	describe("deleteAccount", () => {
		let account;

		beforeEach(() => {
			account = angular.copy(accountIndexController.accounts["Bank accounts"].accounts[1]);
			sinon.stub(accountIndexController, "calculateAccountTypeTotal");
		});

		it("should fetch the account", () => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			accountModel.find.should.have.been.calledWith(account.id);
		});

		it("should show an alert if the account has transactions", () => {
			accountIndexController.deleteAccount("Bank accounts", 2);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.alert.header.should.equal("Account has existing transactions");
		});

		it("should show the delete account modal if the account has no transactions", () => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			$uibModal.open.should.have.been.called;
			$uibModal.resolves.account.should.deep.equal(account);
		});

		it("should remove the account from the accounts list when the modal is closed", () => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			$uibModal.close(account);
			accountIndexController.accounts["Bank accounts"].accounts.should.not.include(account);
		});

		it("should recalculate the account type total when the modal is closed", () => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			$uibModal.close(account);
			accountIndexController.calculateAccountTypeTotal.should.have.been.calledWith("Bank accounts");
		});
	});

	describe("keyHandler", () => {
		const INSERT_KEY = 45,
					N_KEY = 78;

		let	event;

		beforeEach(() => {
			event = {
				keyCode: 13,
				preventDefault: sinon.stub()
			};
			sinon.stub(accountIndexController, "editAccount");
		});

		it("should invoke editAccount() with no account when the Insert key is pressed", () => {
			event.keyCode = INSERT_KEY;
			event.ctrlKey = false;
			accountIndexController.keyHandler(event);
			accountIndexController.editAccount.should.have.been.called;
			event.preventDefault.should.have.been.called;
		});

		it("should invoke editAccount() with no account when the CTRL+N keys are pressed", () => {
			event.keyCode = N_KEY;
			event.ctrlKey = true;
			accountIndexController.keyHandler(event);
			accountIndexController.editAccount.should.have.been.called;
			event.preventDefault.should.have.been.called;
		});

		it("should do nothing when any other keys are pressed", () => {
			accountIndexController.keyHandler(event);
			accountIndexController.editAccount.should.not.have.been.called;
			event.preventDefault.should.not.have.been.called;
		});
	});

	it("should attach a keydown handler to the document", () => {
		sinon.stub(accountIndexController, "keyHandler");
		$(document).triggerHandler("keydown");
		accountIndexController.keyHandler.should.have.been.called;
	});

	describe("on destroy", () => {
		beforeEach(() => {
			sinon.stub(accountIndexController, "keyHandler");
			accountIndexController.$scope.$emit("$destroy");
		});

		it("should remove the keydown handler from the document", () => {
			$(document).triggerHandler("keydown");
			accountIndexController.keyHandler.should.not.have.been.called;
		});
	});

	describe("calculateAccountTypeTotal", () => {
		it("should sum the closing balances of all accounts of a specified type", () => {
			const originalTotal = accountIndexController.accounts["Bank accounts"].total;

			accountIndexController.accounts["Bank accounts"].accounts[0].closing_balance += 10;
			accountIndexController.calculateAccountTypeTotal("Bank accounts");
			accountIndexController.accounts["Bank accounts"].total.should.equal(originalTotal + 10);
		});
	});

	describe("toggleFavourite", () => {
		let account;

		beforeEach(() => {
			[account] = accountIndexController.accounts["Bank accounts"].accounts;
		});

		it("should favourite the account", () => {
			account.favourite = false;
			accountIndexController.toggleFavourite("Bank accounts", 0);
			account.favourite.should.be.true;
		});

		it("should unfavourite the account", () => {
			account.favourite = true;
			accountIndexController.toggleFavourite("Bank accounts", 0);
			account.favourite.should.be.false;
		});

		afterEach(() => accountModel.toggleFavourite.should.have.been.called);
	});
});
