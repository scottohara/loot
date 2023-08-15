import type {
	Transaction,
	TransactionFlagScope,
	TransactionFlagType
} from "~/transactions/types";
import type {
	UibModalMock,
	UibModalMockResolves
} from "~/mocks/node-modules/angular/types";
import type DirectiveTest from "~/mocks/loot/directivetest";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";
import { createBasicTransaction } from "~/mocks/transactions/factories";
import sinon from "sinon";

describe("transactionFlag", (): void => {
	let	transactionFlag: DirectiveTest,
			$sce: angular.ISCEService,
			$uibModal: UibModalMock,
			ogTableNavigableService: OgTableNavigableService,
			isolateScope: TransactionFlagScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal"])) as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$sce_: angular.ISCEService, directiveTest: DirectiveTest, _$uibModal_: UibModalMock, _ogTableNavigableService_: OgTableNavigableService): void => {
		$sce = _$sce_;
		$uibModal = _$uibModal_;
		ogTableNavigableService = _ogTableNavigableService_;
		transactionFlag = directiveTest;
		transactionFlag.configure("transaction-flag", "div");
		transactionFlag.scope.model = createBasicTransaction({ id: 456 });
	}) as Mocha.HookFunction);

	const scenarios: { flagType: TransactionFlagType; tooltip: string; }[] = [
		{
			flagType: "followup",
			tooltip: "<strong class=\"followup\">Follow Up</strong><br/>Test flag"
		},
		{
			flagType: "noreceipt",
			tooltip: "<strong class=\"noreceipt\">No Receipt</strong><br/>Test flag"
		},
		{
			flagType: "taxdeductible",
			tooltip: "<strong class=\"taxdeductible\">Tax Deductible</strong><br/>Test flag"
		}
	];

	// Helper function in lieu of beforeEach (which we can't use for dynamically generated specs)
	function setup(scenario: { flagType: TransactionFlagType; tooltip: string; }): void {
		(transactionFlag.scope.model as Transaction).flag_type = scenario.flagType;
		(transactionFlag.scope.model as Transaction).flag = "Test flag";
		transactionFlag.compile({ "transaction-flag": "model" });
		transactionFlag.scope.$digest();
		isolateScope = transactionFlag["element"].isolateScope();
	}

	scenarios.forEach((scenario: { flagType: TransactionFlagType; tooltip: string; }): void => {
		it(`should set the tooltip when the flag type is ${String(scenario.flagType)}`, (): void => {
			setup(scenario);
			$sce.getTrustedHtml(isolateScope.tooltip).should.equal(scenario.tooltip);
		});
	});

	describe("element", (): void => {
		let i: JQuery<Element>;

		beforeEach((): void => {
			transactionFlag.compile({ "transaction-flag": "model" });
			transactionFlag.scope.$digest();
			i = transactionFlag["element"].find("i");
		});

		it("should display the icon for the flag", (): Chai.Assertion => i.hasClass("glyphicon-flag").should.be.true);

		it("should be transparent when the transaction is not flagged", (): Chai.Assertion => i.hasClass("active").should.be.false);

		it("should be opaque when the transaction is flagged", (): void => {
			(transactionFlag.scope.model as Transaction).flag_type = "noreceipt";
			transactionFlag.compile({ "transaction-flag": "model" });
			transactionFlag.scope.$digest();
			transactionFlag["element"].find("i").hasClass("active").should.be.true;
			transactionFlag["element"].find("i").hasClass("noreceipt").should.be.true;
		});
	});

	describe("on click", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = transactionFlag.scope.model as Transaction;
			transactionFlag.compile({ "transaction-flag": "model" });
			transactionFlag.scope.$digest();
			isolateScope = transactionFlag["element"].isolateScope();
			transactionFlag["element"].triggerHandler("click");
		});

		it("should disable navigation on the table", (): Chai.Assertion => ogTableNavigableService.enabled.should.be.false);

		it("should show the flag modal for the transaction", (): void => {
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.deep.equal(transaction);
		});

		it("should update the transaction in the list of transactions when the modal is closed", (): void => {
			transaction.flag_type = "noreceipt";
			transaction.flag = "test flag";
			$uibModal.close(transaction);
			isolateScope.transaction.should.deep.equal(transaction);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dismissed", (): void => {
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			transactionFlag.compile({ "transaction-flag": "model" });
			transactionFlag.scope.$digest();
			isolateScope = transactionFlag["element"].isolateScope();
			sinon.stub(isolateScope, "clickHandler");
			transactionFlag["element"].triggerHandler("$destroy");
		});

		it("should remove the click handler from the element", (): void => {
			transactionFlag["element"].triggerHandler("click");
			isolateScope.clickHandler.should.not.have.been.called;
		});
	});
});
