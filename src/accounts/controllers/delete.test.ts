import type {
	Account,
	AccountStatus,
	AccountType
} from "~/accounts/types";
import type AccountDeleteController from "~/accounts/controllers/delete";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("AccountDeleteController", (): void => {
	let accountDeleteController: AccountDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			accountModel: AccountModelMock,
			account: Account;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "accountModel", "account"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _accountModel_: AccountModelMock, _account_: Account): void => {
		$uibModalInstance = _$uibModalInstance_;
		accountModel = _accountModel_;
		account = _account_;
		accountDeleteController = controllerTest("AccountDeleteController") as AccountDeleteController;
	}) as Mocha.HookFunction);

	it("should make the passed account available to the view", (): void => {
		account.account_type = `${account.account_type.charAt(0).toUpperCase()}${account.account_type.substr(1)}` as AccountType;
		account.status = `${account.status.charAt(0).toUpperCase()}${account.status.substr(1)}` as AccountStatus;
		expect(accountDeleteController.account).to.deep.equal(account);
	});

	it("should capitalise the account type", (): Chai.Assertion => expect(accountDeleteController.account.account_type).to.equal("Bank"));

	it("should capitalise the status", (): Chai.Assertion => expect(accountDeleteController.account.status).to.equal("Open"));

	describe("deleteAccount", (): void => {
		it("should reset any previous error messages", (): void => {
			accountDeleteController.errorMessage = "error message";
			accountDeleteController.deleteAccount();
			expect(accountDeleteController.errorMessage as string | null).to.be.null;
		});

		it("should delete the account", (): void => {
			accountDeleteController.deleteAccount();
			expect(accountModel.destroy).to.have.been.calledWith(account);
		});

		it("should close the modal when the account delete is successful", (): void => {
			accountDeleteController.deleteAccount();
			expect($uibModalInstance.close).to.have.been.called;
		});

		it("should display an error message when the account delete is unsuccessful", (): void => {
			accountDeleteController.account.id = -1;
			accountDeleteController.deleteAccount();
			expect(accountDeleteController.errorMessage as string).to.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			accountDeleteController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
