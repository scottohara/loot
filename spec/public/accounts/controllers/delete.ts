import {
	Account,
	AccountStatus,
	AccountType
} from "accounts/types";
import AccountDeleteController from "accounts/controllers/delete";
import { AccountModelMock } from "mocks/accounts/types";
import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";

describe("AccountDeleteController", (): void => {
	let accountDeleteController: AccountDeleteController,
			$uibModalInstance: UibModalInstanceMock,
			accountModel: AccountModelMock,
			account: Account;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "accountModel", "account"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((controllerTest: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _accountModel_: AccountModelMock, _account_: Account): void => {
		$uibModalInstance = _$uibModalInstance_;
		accountModel = _accountModel_;
		account = _account_;
		accountDeleteController = controllerTest("AccountDeleteController") as AccountDeleteController;
	}));

	it("should make the passed account available to the view", (): void => {
		account.account_type = `${account.account_type.charAt(0).toUpperCase()}${account.account_type.substr(1)}` as AccountType;
		account.status = `${account.status.charAt(0).toUpperCase()}${account.status.substr(1)}` as AccountStatus;
		accountDeleteController.account.should.deep.equal(account);
	});

	it("should capitalise the account type", (): Chai.Assertion => accountDeleteController.account.account_type.should.equal("Bank"));

	it("should capitalise the status", (): Chai.Assertion => accountDeleteController.account.status.should.equal("Open"));

	describe("deleteAccount", (): void => {
		it("should reset any previous error messages", (): void => {
			accountDeleteController.errorMessage = "error message";
			accountDeleteController.deleteAccount();
			(null === accountDeleteController.errorMessage).should.be.true;
		});

		it("should delete the account", (): void => {
			accountDeleteController.deleteAccount();
			accountModel.destroy.should.have.been.calledWith(account);
		});

		it("should close the modal when the account delete is successful", (): void => {
			accountDeleteController.deleteAccount();
			$uibModalInstance.close.should.have.been.called;
		});

		it("should display an error message when the account delete is unsuccessful", (): void => {
			accountDeleteController.account.id = -1;
			accountDeleteController.deleteAccount();
			(accountDeleteController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			accountDeleteController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
