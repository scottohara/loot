import type {
	Account,
	AccountType
} from "~/accounts/types";
import type AccountReconcileController from "~/accounts/controllers/reconcile";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";

describe("AccountReconcileController", (): void => {
	let accountReconcileController: AccountReconcileController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			$window: angular.IWindowService,
			account: Account;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootAccounts", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "$window", "account"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _$window_: angular.IWindowService, _account_: Account): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		$window = _$window_;
		account = _account_;
		accountReconcileController = controllerTest("AccountReconcileController") as AccountReconcileController;
	}) as Mocha.HookFunction);

	it("should fetch the closing balance from localStorage and make it available to the view", (): void => {
		expect($window.localStorage["getItem"]).to.have.been.calledWith("lootClosingBalance-1");
		expect(accountReconcileController.closingBalance).to.equal(1000);
	});

	it("should expect a postive closing balance to be entered by the user", (): Chai.Assertion => expect(accountReconcileController.expectNegativeBalance).to.be.false);

	["credit", "loan"].forEach((accountType: AccountType): void => {
		it(`should expect a negative closing balance to be entered by the user for ${accountType} accounts`, (): void => {
			account.account_type = accountType;
			accountReconcileController = controllerTest("AccountReconcileController", { account }) as AccountReconcileController;
			expect(accountReconcileController.expectNegativeBalance).to.be.true;
		});
	});

	describe("start", (): void => {
		it("should save the closing balance to localStorage", (): void => {
			accountReconcileController.start();
			expect($window.localStorage["setItem"]).to.have.been.calledWith("lootClosingBalance-1", "1000");
		});

		it("should close the modal when the transaction delete is successful", (): void => {
			accountReconcileController.start();
			expect($uibModalInstance.close).to.have.been.calledWith(1000);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			accountReconcileController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
