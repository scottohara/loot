import type {
	Transaction,
	TransactionStatus,
	TransactionStatusScope,
} from "~/transactions/types";
import type DirectiveTest from "~/mocks/loot/directivetest";
import type { DirectiveTestModel } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import { createBasicTransaction } from "~/mocks/transactions/factories";
import sinon from "sinon";

describe("transactionStatus", (): void => {
	let transactionStatus: DirectiveTest,
		transactionModel: TransactionModelMock,
		$sce: angular.ISCEService,
		isolateScope: TransactionStatusScope;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load(["transactionModel"]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_$sce_: angular.ISCEService,
				directiveTest: DirectiveTest,
				_transactionModel_: TransactionModelMock,
			): void => {
				$sce = _$sce_;
				transactionStatus = directiveTest;
				transactionStatus.configure("transaction-status", "div");
				transactionStatus.scope.model = {
					account: createAccount({ id: 123 }),
					transaction: createBasicTransaction({ id: 456 }),
				};
				transactionModel = _transactionModel_;
			},
		) as Mocha.HookFunction,
	);

	const scenarios: {
		currentStatus: TransactionStatus;
		nextStatus: TransactionStatus;
		icon: "lock" | "tag";
		tooltip: string;
	}[] = [
		{
			currentStatus: "",
			nextStatus: "Cleared",
			icon: "tag",
			tooltip:
				'Status: <strong class="unreconciled">Unreconciled</strong><br/>Click to mark as <strong class="cleared">Cleared</strong>',
		},
		{
			currentStatus: "Unreconciled",
			nextStatus: "Cleared",
			icon: "tag",
			tooltip:
				'Status: <strong class="unreconciled">Unreconciled</strong><br/>Click to mark as <strong class="cleared">Cleared</strong>',
		},
		{
			currentStatus: "Reconciled",
			nextStatus: "Unreconciled",
			icon: "lock",
			tooltip:
				'Status: <strong class="reconciled">Reconciled</strong><br/>Click to mark as <strong class="unreconciled">Unreconciled</strong>',
		},
		{
			currentStatus: "Cleared",
			nextStatus: "Reconciled",
			icon: "tag",
			tooltip:
				'Status: <strong class="cleared">Cleared</strong><br/>Click to mark as <strong class="reconciled">Reconciled</strong>',
		},
	];

	// Helper function in lieu of beforeEach (which we can't use for dynamically generated specs)
	function setup(scenario: {
		currentStatus: TransactionStatus;
		nextStatus: TransactionStatus;
		icon: "lock" | "tag";
		tooltip: string;
	}): void {
		(
			(transactionStatus.scope.model as DirectiveTestModel)
				.transaction as Transaction
		).status = scenario.currentStatus;
		transactionStatus.compile({ "transaction-status": "model" });
		transactionStatus.scope.$digest();
		isolateScope = transactionStatus["element"].isolateScope();
	}

	scenarios.forEach(
		(scenario: {
			currentStatus: TransactionStatus;
			nextStatus: TransactionStatus;
			icon: "lock" | "tag";
			tooltip: string;
		}): void => {
			if ("" === scenario.currentStatus) {
				it(`should set the current status to 'Unreconciled' when the transaction status is ${String(
					scenario.currentStatus,
				)}`, (): void => {
					setup(scenario);
					expect(String(isolateScope.currentStatus)).to.equal("Unreconciled");
				});
			}

			it(`should set the next status to ${
				scenario.nextStatus
			} when the current status is ${String(
				scenario.currentStatus,
			)}`, (): void => {
				setup(scenario);
				expect(String(isolateScope.nextStatus)).to.equal(scenario.nextStatus);
			});

			it(`should set the icon to ${
				scenario.icon
			} when the current status is ${String(
				scenario.currentStatus,
			)}`, (): void => {
				setup(scenario);
				expect(isolateScope.icon).to.equal(scenario.icon);
			});

			it(`should set the tooltip when the current status is ${String(
				scenario.currentStatus,
			)}`, (): void => {
				setup(scenario);
				expect($sce.getTrustedHtml(isolateScope.tooltip)).to.equal(
					scenario.tooltip,
				);
			});
		},
	);

	describe("element", (): void => {
		let i: JQuery<Element>;

		beforeEach((): void => {
			transactionStatus.compile({ "transaction-status": "model" });
			transactionStatus.scope.$digest();
			i = transactionStatus["element"].find("i");
		});

		it("should display the icon for the current status", (): Chai.Assertion =>
			expect(i.hasClass("glyphicon-tag")).to.be.true);

		it("should style the element according to the current status", (): Chai.Assertion =>
			expect(i.hasClass("unreconciled")).to.be.true);

		it("should be transparent when the current status is Unreconciled", (): Chai.Assertion =>
			expect(i.hasClass("active")).to.be.false);

		it("should be opaque when the current status is not Unreconciled", (): void => {
			(
				(transactionStatus.scope.model as DirectiveTestModel)
					.transaction as Transaction
			).status = "Cleared";
			transactionStatus.compile({ "transaction-status": "model" });
			transactionStatus.scope.$digest();
			expect(transactionStatus["element"].find("i").hasClass("active")).to.be
				.true;
		});
	});

	describe("on click", (): void => {
		beforeEach((): void => {
			transactionStatus.compile({ "transaction-status": "model" });
			transactionStatus.scope.$digest();
			isolateScope = transactionStatus["element"].isolateScope();
		});

		it("should update the transaction status to the next status if not Unreconciled", (): void => {
			isolateScope.nextStatus = "Cleared";
			transactionStatus["element"].triggerHandler("click");
			expect(transactionModel.updateStatus).to.have.been.calledWith(
				"/accounts/123",
				456,
				"Cleared",
			);
		});

		it("should clear the transaction status if the next status is Unreconciled", (): void => {
			isolateScope.nextStatus = "Unreconciled";
			transactionStatus["element"].triggerHandler("click");
			expect(transactionModel.updateStatus).to.have.been.calledWith(
				"/accounts/123",
				456,
				"",
			);
		});

		it("should set the current status", (): void => {
			isolateScope.currentStatus = "Cleared";
			isolateScope.nextStatus = "Reconciled";
			transactionStatus["element"].triggerHandler("click");
			expect(isolateScope.currentStatus).to.equal("Reconciled");
			expect(isolateScope.nextStatus).to.equal("Unreconciled");
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			transactionStatus.compile({ "transaction-status": "model" });
			transactionStatus.scope.$digest();
			isolateScope = transactionStatus["element"].isolateScope();
			sinon.stub(isolateScope, "clickHandler");
			transactionStatus["element"].triggerHandler("$destroy");
		});

		it("should remove the click handler from the element", (): void => {
			transactionStatus["element"].triggerHandler("click");
			expect(isolateScope.clickHandler).to.not.have.been.called;
		});
	});
});
