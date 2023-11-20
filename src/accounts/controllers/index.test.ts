import type { Account, Accounts } from "~/accounts/types";
import type {
	ControllerTestFactory,
	JQueryKeyEventObjectMock,
} from "~/mocks/types";
import type {
	UibModalMock,
	UibModalMockResolves,
} from "~/mocks/node-modules/angular/types";
import $ from "jquery";
import type AccountIndexController from "~/accounts/controllers";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalAlert } from "~/og-components/og-modal-alert/types";
import type { SinonStub } from "sinon";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import sinon from "sinon";

describe("AccountIndexController", (): void => {
	let accountIndexController: AccountIndexController,
		$window: angular.IWindowService,
		$uibModal: UibModalMock,
		accountModel: AccountModelMock,
		accountsWithBalances: Accounts;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootAccounts",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModal",
					"accountModel",
					"accountsWithBalances",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_$window_: angular.IWindowService,
				_$uibModal_: UibModalMock,
				controllerTest: ControllerTestFactory,
				_accountModel_: AccountModelMock,
				_accountsWithBalances_: Accounts,
			): void => {
				$window = _$window_;
				$uibModal = _$uibModal_;
				accountModel = _accountModel_;
				accountsWithBalances = _accountsWithBalances_;
				$window.$ = $;
				accountIndexController = controllerTest("AccountIndexController", {
					accounts: accountsWithBalances,
				}) as AccountIndexController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the account list available to the view", (): Chai.Assertion =>
		expect(accountIndexController.accounts).to.equal(accountsWithBalances));

	it("should calculate the net worth by summing the account type totals", (): Chai.Assertion =>
		expect(accountIndexController.netWorth).to.equal(200));

	describe("editAccount", (): void => {
		let account: Account;

		beforeEach((): void => {
			account = angular.copy(
				accountIndexController.accounts["Bank accounts"].accounts[1],
			);
			sinon.stub(
				accountIndexController,
				"calculateAccountTypeTotal" as keyof AccountIndexController,
			);
		});

		describe("(edit existing)", (): void => {
			beforeEach((): void =>
				accountIndexController.editAccount("Bank accounts", 1),
			);

			it("should open the edit account modal with an account", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(accountModel.addRecent).to.have.been.calledWith(account);
				expect(
					($uibModal.resolves as UibModalMockResolves).account as Account,
				).to.deep.equal(account);
			});

			describe("(account type changed)", (): void => {
				beforeEach((): void => {
					account.account_type = "investment";
					$uibModal.close(account);
				});

				it("should remove the account from original account type's list", (): Chai.Assertion =>
					expect(
						accountIndexController.accounts["Bank accounts"].accounts,
					).to.not.include(account));

				it("should recalculate the original account type total", (): Chai.Assertion =>
					expect(
						accountIndexController["calculateAccountTypeTotal"],
					).to.have.been.calledWith("Bank accounts"));

				it("should add the account to the new account type's list", (): Chai.Assertion =>
					expect(
						accountIndexController.accounts["Investment accounts"].accounts,
					).to.include(account));
			});

			it("should update the account in the list of accounts when the modal is closed", (): void => {
				account.name = "edited account";
				$uibModal.close(account);
				expect(
					accountIndexController.accounts["Bank accounts"].accounts,
				).to.include(account);
			});
		});

		describe("(add new)", (): void => {
			beforeEach((): void => {
				account = createAccount({ id: 999, name: "new account" });
				accountIndexController.editAccount();
			});

			it("should open the edit account modal without an account", (): void => {
				expect($uibModal.open).to.have.been.called;
				expect(accountModel.addRecent).to.not.have.been.called;
				expect(($uibModal.resolves as UibModalMockResolves).account).to.be
					.undefined;
			});

			it("should add the new account to the list of accounts when the modal is closed", (): void => {
				$uibModal.close(account);
				expect(
					accountIndexController.accounts[
						"Bank accounts"
					].accounts.pop() as Account,
				).to.deep.equal(account);
			});

			it("should add the new account to the recent list", (): void => {
				$uibModal.close(account);
				expect(accountModel.addRecent).to.have.been.calledWith(account);
			});
		});

		it("should resort the accounts list when the modal is closed", (): void => {
			const accountWithHighestName: Account = angular.copy(
				accountIndexController.accounts["Bank accounts"].accounts[2],
			);

			accountIndexController.editAccount();
			$uibModal.close(account);
			expect(
				accountIndexController.accounts[
					"Bank accounts"
				].accounts.pop() as Account,
			).to.deep.equal(accountWithHighestName);
		});

		it("should recalculate the account type total when the modal is closed", (): void => {
			accountIndexController.editAccount();
			$uibModal.close(account);
			expect(
				accountIndexController["calculateAccountTypeTotal"],
			).to.have.been.calledWith("Bank accounts");
		});

		it("should not change the accounts list when the modal is dismissed", (): void => {
			const originalAccounts: Accounts = angular.copy(
				accountIndexController.accounts,
			);

			accountIndexController.editAccount();
			$uibModal.dismiss();
			expect(accountIndexController.accounts).to.deep.equal(originalAccounts);
		});
	});

	describe("deleteAccount", (): void => {
		let account: Account;

		beforeEach((): void => {
			account = angular.copy(
				accountIndexController.accounts["Bank accounts"].accounts[1],
			);
			sinon.stub(
				accountIndexController,
				"calculateAccountTypeTotal" as keyof AccountIndexController,
			);
		});

		it("should fetch the account", (): void => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			expect(accountModel.find).to.have.been.calledWith(account.id);
		});

		it("should show an alert if the account has transactions", (): void => {
			accountIndexController.deleteAccount("Bank accounts", 2);
			expect($uibModal.open).to.have.been.called;
			expect(
				(($uibModal.resolves as UibModalMockResolves).alert as OgModalAlert)
					.header,
			).to.equal("Account has existing transactions");
		});

		it("should show the delete account modal if the account has no transactions", (): void => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			expect($uibModal.open).to.have.been.called;
			expect(
				($uibModal.resolves as UibModalMockResolves).account as Account,
			).to.deep.equal(account);
		});

		it("should remove the account from the accounts list when the modal is closed", (): void => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			$uibModal.close(account);
			expect(
				accountIndexController.accounts["Bank accounts"].accounts,
			).to.not.include(account);
		});

		it("should recalculate the account type total when the modal is closed", (): void => {
			accountIndexController.deleteAccount("Bank accounts", 1);
			$uibModal.close(account);
			expect(
				accountIndexController["calculateAccountTypeTotal"],
			).to.have.been.calledWith("Bank accounts");
		});
	});

	describe("keyHandler", (): void => {
		const INSERT_KEY = 45,
			N_KEY = 78;

		let event: JQueryKeyEventObjectMock;

		beforeEach((): void => {
			event = {
				keyCode: 13,
				preventDefault: sinon.stub(),
			};
			sinon.stub(accountIndexController, "editAccount");
		});

		it("should invoke editAccount() with no account when the Insert key is pressed", (): void => {
			event.keyCode = INSERT_KEY;
			accountIndexController["keyHandler"](event as JQueryKeyEventObject);
			expect(accountIndexController["editAccount"]).to.have.been.called;
			expect(event.preventDefault as SinonStub).to.have.been.called;
		});

		it("should invoke editAccount() with no account when the CTRL+N keys are pressed", (): void => {
			event.keyCode = N_KEY;
			event.ctrlKey = true;
			accountIndexController["keyHandler"](event as JQueryKeyEventObject);
			expect(accountIndexController["editAccount"]).to.have.been.called;
			expect(event.preventDefault as SinonStub).to.have.been.called;
		});

		it("should do nothing when any other keys are pressed", (): void => {
			accountIndexController["keyHandler"](event as JQueryKeyEventObject);
			expect(accountIndexController["editAccount"]).to.not.have.been.called;
			expect(event.preventDefault as SinonStub).to.not.have.been.called;
		});
	});

	it("should attach a keydown handler to the document", (): void => {
		sinon.stub(
			accountIndexController,
			"keyHandler" as keyof AccountIndexController,
		);
		$window.$(document).triggerHandler("keydown");
		expect(accountIndexController["keyHandler"]).to.have.been.called;
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(
				accountIndexController,
				"keyHandler" as keyof AccountIndexController,
			);
			accountIndexController["$scope"].$emit("$destroy");
		});

		it("should remove the keydown handler from the document", (): void => {
			$window.$(document).triggerHandler("keydown");
			expect(accountIndexController["keyHandler"]).to.not.have.been.called;
		});
	});

	describe("calculateAccountTypeTotal", (): void => {
		it("should sum the closing balances of all accounts of a specified type", (): void => {
			const originalTotal: number =
				accountIndexController.accounts["Bank accounts"].total;

			accountIndexController.accounts[
				"Bank accounts"
			].accounts[0].closing_balance += 10;
			accountIndexController["calculateAccountTypeTotal"]("Bank accounts");
			expect(accountIndexController.accounts["Bank accounts"].total).to.equal(
				originalTotal + 10,
			);
		});
	});

	describe("toggleFavourite", (): void => {
		let account: Account;

		beforeEach((): void => {
			[account] = accountIndexController.accounts["Bank accounts"].accounts;
		});

		it("should favourite the account", (): void => {
			account.favourite = false;
			accountIndexController.toggleFavourite("Bank accounts", 0);
			expect(account.favourite).to.be.true;
		});

		it("should unfavourite the account", (): void => {
			account.favourite = true;
			accountIndexController.toggleFavourite("Bank accounts", 0);
			expect(account.favourite).to.be.false;
		});

		afterEach(
			(): Chai.Assertion =>
				expect(accountModel.toggleFavourite).to.have.been.called,
		);
	});
});
