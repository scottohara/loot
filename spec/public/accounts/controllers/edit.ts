import type {
	Account,
	AccountStatus,
	AccountType
} from "~/accounts/types";
import type AccountEditController from "~/accounts/controllers/edit";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";

describe("AccountEditController", (): void => {
	let accountEditController: AccountEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			accountModel: AccountModelMock,
			account: Account;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "accountModel", "account"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _accountModel_: AccountModelMock, _account_: Account): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		accountModel = _accountModel_;
		account = _account_;
		accountEditController = controllerTest("AccountEditController") as AccountEditController;
	}) as Mocha.HookFunction);

	describe("when an account is provided", (): void => {
		it("should make the passed account available to the view", (): void => {
			account.account_type = `${account.account_type.charAt(0).toUpperCase()}${account.account_type.substr(1)}` as AccountType;
			account.status = `${account.status.charAt(0).toUpperCase()}${account.status.substr(1)}` as AccountStatus;
			expect(accountEditController.account).to.deep.equal(account);
		});

		it("should set the mode to Edit", (): Chai.Assertion => expect(accountEditController.mode).to.equal("Edit"));

		it("should capitalise the account type", (): Chai.Assertion => expect(accountEditController.account.account_type).to.equal("Bank"));

		it("should capitalise the status", (): Chai.Assertion => expect(accountEditController.account.status).to.equal("Open"));
	});

	describe("when an account is not provided", (): void => {
		beforeEach((): AccountEditController => (accountEditController = controllerTest("AccountEditController", { account: undefined }) as AccountEditController));

		it("should make an empty account object available to the view", (): Chai.Assertion => expect(accountEditController.account).to.deep.equal({ opening_balance: 0 }));

		it("should set the mode to Add", (): Chai.Assertion => expect(accountEditController.mode).to.equal("Add"));
	});

	describe("accountTypes", (): void => {
		it("should return the full list of account types when a filter is not specified", (): Chai.Assertion => expect(accountEditController.accountTypes()).to.deep.equal(["Asset", "Bank", "Cash", "Credit", "Investment", "Liability", "Loan"]));

		it("should return a filtered list of account types when a filter is specified", (): Chai.Assertion => expect(accountEditController.accountTypes("t")).to.deep.equal(["Asset", "Credit", "Investment", "Liability"]));
	});

	describe("accountTypeSelected", (): void => {
		it("should reset the related account if the account type is investment", (): void => {
			accountEditController.account.account_type = "Investment";
			accountEditController.account.related_account = { id: 1, name: "related account", opening_balance: 100 };
			accountEditController.accountTypeSelected();
			expect(accountEditController.account.related_account as Account).to.deep.equal({ opening_balance: 0 });
		});

		it("should clear the related account if the account type is not investment", (): void => {
			accountEditController.account.related_account = { id: 1, name: "related account", opening_balance: 100 };
			accountEditController.accountTypeSelected();
			expect(accountEditController.account.related_account).to.be.null;
		});
	});

	describe("accounts", (): void => {
		it("should fetch the list of accounts", (): void => {
			accountEditController.accounts("b", 2);
			expect(accountModel.all).to.have.been.called;
		});

		it("should return a filtered & limited list of asset accounts", async (): Promise<Chai.Assertion> => expect(await accountEditController.accounts("b", 2)).to.deep.equal([
			createAccount({ id: 4, name: "ba", account_type: "asset" }),
			createAccount({ id: 5, name: "ab", account_type: "asset" })
		]));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			accountEditController.errorMessage = "error message";
			accountEditController.save();
			expect(accountEditController.errorMessage as string | null).to.be.null;
		});

		it("should convert the account type to lower case", (): void => {
			accountEditController.save();
			expect(accountEditController.account.account_type).to.equal("bank");
		});

		it("should convert the status to lower case", (): void => {
			accountEditController.save();
			expect(accountEditController.account.status).to.equal("open");
		});

		it("should save the account", (): void => {
			accountEditController.save();
			expect(accountModel.save).to.have.been.calledWith(account);
		});

		it("should close the modal when the account save is successful", (): void => {
			accountEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(account);
		});

		it("should display an error message when the account save is unsuccessful", (): void => {
			accountEditController.account.id = -1;
			accountEditController.save();
			expect(accountEditController.errorMessage as string).to.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			accountEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
