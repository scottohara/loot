import {
	BaseTransaction,
	BasicTransaction,
	CategorisableTransaction,
	PayeeCashTransaction,
	SecurityHoldingTransaction,
	SecurityTransaction,
	SplitTransaction,
	SplitTransactionChild,
	SplitTransactionType,
	SubcategorisableTransaction,
	Transaction,
	TransactionBatch,
	TransactionFetchDirection,
	TransactionType,
	TransferTransaction,
	TransferrableTransaction
} from "transactions/types";
import {
	ControllerTestFactory,
	EventMock,
	JQueryMouseEventObjectMock
} from "mocks/types";
import {
	Entity,
	EntityModel
} from "loot/types";
import {
	StateMock,
	UibModalMock,
	UibModalMockResolves
} from "mocks/node-modules/angular/types";
import {
	addDays,
	startOfDay,
	subDays
} from "date-fns/esm";
import {
	createBasicTransaction,
	createSecurityHoldingTransaction,
	createSplitTransaction,
	createSubtransaction,
	createSubtransferTransaction,
	createTransferTransaction
} from "mocks/transactions/factories";
import sinon, { SinonStub } from "sinon";
import { Account } from "accounts/types";
import AccountModel from "accounts/models/account";
import { Category } from "categories/types";
import CategoryModel from "categories/models/category";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { OgModalConfirm } from "og-components/og-modal-confirm/types";
import { OgTableActionHandlers } from "og-components/og-table-navigable/types";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import OgViewScrollService from "og-components/og-view-scroll/services/og-view-scroll";
import { Payee } from "payees/types";
import { Security } from "securities/types";
import SecurityModel from "securities/models/security";
import TransactionIndexController from "transactions/controllers";
import { TransactionModelMock } from "mocks/transactions/types";
import angular from "angular";
import createAccount from "mocks/accounts/factories";
import createCategory from "mocks/categories/factories";
import createPayee from "mocks/payees/factories";
import createSecurity from "mocks/securities/factories";

describe("TransactionIndexController", (): void => {
	let	transactionIndexController: TransactionIndexController,
			controllerTest: ControllerTestFactory,
			$transitions: angular.ui.IStateParamsService,
			$uibModal: UibModalMock,
			$timeout: angular.ITimeoutService,
			$window: angular.IWindowService,
			$state: StateMock,
			transactionModel: TransactionModelMock,
			accountModel: AccountModel,
			categoryModel: CategoryModel,
			securityModel: SecurityModel,
			ogTableNavigableService: OgTableNavigableService,
			ogViewScrollService: OgViewScrollService,
			contextModel: EntityModel,
			context: Entity,
			transactionBatch: TransactionBatch,
			deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootTransactions", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "$window", "$state", "transactionModel", "accountModel", "categoryModel", "securityModel", "contextModel", "context", "transactionBatch"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$transitions_: angular.ui.IStateParamsService, _$uibModal_: UibModalMock, _$timeout_: angular.ITimeoutService, _$window_: angular.IWindowService, _$state_: StateMock, _transactionModel_: TransactionModelMock, _accountModel_: AccountModel, _categoryModel_: CategoryModel, _securityModel_: SecurityModel, _ogTableNavigableService_: OgTableNavigableService, _ogViewScrollService_: OgViewScrollService, _contextModel_: EntityModel, _context_: Entity, _transactionBatch_: TransactionBatch): void => {
		controllerTest = _controllerTest_;
		$transitions = _$transitions_;
		$uibModal = _$uibModal_;
		$timeout = _$timeout_;
		$window = _$window_;
		$state = _$state_;
		transactionModel = _transactionModel_;
		accountModel = _accountModel_;
		categoryModel = _categoryModel_;
		securityModel = _securityModel_;
		ogTableNavigableService = _ogTableNavigableService_;
		ogViewScrollService = _ogViewScrollService_;
		contextModel = _contextModel_;
		context = _context_;
		transactionBatch = _transactionBatch_;
		deregisterTransitionSuccessHook = sinon.stub();
		sinon.stub($transitions, "onSuccess").returns(deregisterTransitionSuccessHook);
		sinon.stub(ogViewScrollService, "scrollTo");
		transactionIndexController = controllerTest("TransactionIndexController") as TransactionIndexController;
	}));

	it("should make the passed context available to the view", (): Chai.Assertion => transactionIndexController.context.should.deep.equal(context));

	it("should make the passed context type available to the view", (): Chai.Assertion => String(transactionIndexController.contextType).should.equal(contextModel.type));

	it("should not set a context type when a context model was not specified", (): void => {
		transactionIndexController = controllerTest("TransactionIndexController", { contextModel: null }) as TransactionIndexController;
		(undefined === transactionIndexController.contextType).should.be.true;
	});

	it("should fetch the show all details setting", (): Chai.Assertion => transactionModel.allDetailsShown.should.have.been.called);

	it("should make today's date available to the view", (): Chai.Assertion => transactionIndexController.today.should.deep.equal(startOfDay(new Date())));

	it("should set an empty array of transactions to the view", (): void => {
		transactionIndexController = controllerTest("TransactionIndexController", { transactionBatch: { transactions: { length: 0 } as Transaction[], openingBalance: 0, atEnd: false } }) as TransactionIndexController;
		transactionIndexController.transactions.should.be.an("array");
		transactionIndexController.transactions.should.be.empty;
	});

	it("should process the passed transaction batch", (): number => (transactionIndexController["openingBalance"] = transactionBatch.openingBalance));

	it("should ensure the transaction is focussed when the transaction id state param is present", (): void => {
		$state.params.transactionId = "1";
		transactionIndexController = controllerTest("TransactionIndexController", { $state }) as TransactionIndexController;
		transactionIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		(transactionIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(0);
	});

	it("should set the previous/next loading indicators to false", (): void => {
		transactionIndexController.loading.prev.should.be.false;
		transactionIndexController.loading.next.should.be.false;
	});

	it("should register a success transition hook", (): Chai.Assertion => $transitions.onSuccess.should.have.been.calledWith({ to: "**.transactions.transaction" }, sinon.match.func));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(transactionIndexController as angular.IController).$scope.$emit("$destroy");
		deregisterTransitionSuccessHook.should.have.been.called;
	});

	it("should ensure the transaction is focussed when the transaction id state param changes", (): void => {
		const toParams = { transactionId: "1" };

		sinon.stub(transactionIndexController, "transitionSuccessHandler" as keyof TransactionIndexController);
		$transitions.onSuccess.firstCall.args[1]({ params: sinon.stub().withArgs("to").returns(toParams) });
		transactionIndexController["transitionSuccessHandler"].should.have.been.calledWith(Number(toParams.transactionId));
	});

	it("should scroll to the bottom when the controller loads", (): void => {
		$timeout.flush();
		ogViewScrollService.scrollTo.should.have.been.calledWith("bottom");
	});

	describe("editTransaction", (): void => {
		let	transaction: Transaction,
				contextChangedStub: SinonStub;

		beforeEach((): void => {
			contextChangedStub = sinon.stub(transactionIndexController, "contextChanged" as keyof TransactionIndexController);
			sinon.stub(transactionIndexController, "updateClosingBalance" as keyof TransactionIndexController);
			sinon.stub(transactionIndexController, "getTransactions");
			sinon.stub(transactionIndexController, "updateRunningBalances" as keyof TransactionIndexController);
			sinon.stub(transactionIndexController, "focusTransaction" as keyof TransactionIndexController);
			transaction = angular.copy(transactionIndexController.transactions[1]);
		});

		it("should disable navigation on the table", (): void => {
			transactionIndexController["editTransaction"]();
			ogTableNavigableService.enabled.should.be.false;
		});

		describe("(edit existing)", (): void => {
			it("should do nothing if the transaction can't be edited", (): void => {
				sinon.stub(transactionIndexController, "isAllowed" as keyof TransactionIndexController).returns(false);
				transactionIndexController["editTransaction"](1);
				Boolean(ogTableNavigableService.enabled).should.be.true;
				$uibModal.open.should.not.have.been.called;
			});

			it("should open the edit transaction modal with a transaction", (): void => {
				transactionIndexController["editTransaction"](1);
				$uibModal.open.should.have.been.called;
				(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.deep.equal(transaction);
				transactionModel.findSubtransactions.should.not.have.been.called;
			});

			const scenarios: SplitTransactionType[] = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it(`should prefetch the subtransactions for a ${scenario} transaction`, (): void => {
					transactionIndexController.transactions[1].transaction_type = scenario;
					transactionIndexController["editTransaction"](1);
					transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
					(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.eventually.have.property("subtransactions");
				});
			});

			it("should update the closing balance when the modal is closed", (): void => {
				const originalTransaction: Transaction = angular.copy(transaction);

				transaction.memo = "edited transaction";
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				transactionIndexController["updateClosingBalance"].should.have.been.calledWith(originalTransaction, transaction);
			});

			it("should update the transaction in the list of transactions when the modal is closed", (): void => {
				transaction.memo = "edited transaction";
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				transactionIndexController.transactions.should.include(transaction);
			});
		});

		describe("(add new)", (): void => {
			let newTransaction: Partial<BaseTransaction>;

			beforeEach((): void => {
				newTransaction = {
					transaction_type: "Basic",
					transaction_date: startOfDay(new Date())
				} as Partial<BaseTransaction>;
			});

			describe("(default values)", (): void => {
				beforeEach((): void => {
					transactionModel.lastTransactionDate = subDays(startOfDay(new Date()), 1);
					(newTransaction as Transaction).transaction_date = transactionModel.lastTransactionDate;
				});

				describe("(context type is security)", (): void => {
					it("should open the edit transaction modal with a default security", (): void => {
						transactionIndexController = controllerTest("TransactionIndexController", { contextModel: securityModel as EntityModel, context: createSecurity() as Entity }) as TransactionIndexController;
						(newTransaction as SecurityTransaction).transaction_type = "SecurityHolding";
						(newTransaction as SecurityTransaction).security = transactionIndexController.context as Security;
					});
				});

				describe("(context type is not security)", (): void => {
					it("should open the edit transaction modal with a default primary account if the context type is account", (): void => {
						transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel as EntityModel, context: createAccount() as Entity }) as TransactionIndexController;
						(newTransaction as Transaction).primary_account = transactionIndexController.context as Account;
					});

					it("should open the edit transaction modal with a default payee if the context type is payee", (): Payee => ((newTransaction as PayeeCashTransaction).payee = transactionIndexController.context as Payee));

					it("should open the edit transaction modal with a default category if the context type is category and the context is a category", (): void => {
						transactionIndexController = controllerTest("TransactionIndexController", { contextModel: categoryModel as EntityModel, context: createCategory() as Entity }) as TransactionIndexController;
						(newTransaction as CategorisableTransaction).category = transactionIndexController.context as Category;
						(newTransaction as SubcategorisableTransaction).subcategory = null;
					});

					it("should open the edit transaction modal with a default category and subcategory if the context type is category and the context is a subcategory", (): void => {
						(newTransaction as CategorisableTransaction).category = createCategory();
						transactionIndexController = controllerTest("TransactionIndexController", { contextModel: categoryModel as EntityModel, context: createCategory({ parent: (newTransaction as CategorisableTransaction).category as Category }) as Entity }) as TransactionIndexController;
						(newTransaction as SubcategorisableTransaction).subcategory = transactionIndexController.context as Category;
					});
				});

				afterEach((): void => {
					transactionIndexController["editTransaction"]();
					$uibModal.open.should.have.been.called;
					(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.deep.equal(newTransaction);
				});
			});

			it("should update the closing balance when the modal is closed", (): void => {
				// No original transaction, leave uninitialised
				let originalTransaction;

				transactionIndexController["editTransaction"]();
				$uibModal.close(newTransaction as Transaction);
				transactionIndexController["updateClosingBalance"].should.have.been.calledWith(originalTransaction, newTransaction);
			});

			it("should add the new transaction to the list of transactions when the modal is closed", (): void => {
				(newTransaction as PayeeCashTransaction).payee = context as Payee;
				transactionIndexController["editTransaction"]();
				$uibModal.close(newTransaction as Transaction);
				(transactionIndexController.transactions.pop() as Transaction).should.deep.equal(newTransaction);
			});
		});

		it("should check if the context has changed when the modal is closed", (): void => {
			transactionIndexController["editTransaction"](1);
			$uibModal.close(transaction);
			transactionIndexController["contextChanged"].should.have.been.calledWith(transaction);
		});

		describe("(on context changed)", (): void => {
			beforeEach((): void => {
				contextChangedStub.returns(true);
				sinon.stub(transactionIndexController, "removeTransaction" as keyof TransactionIndexController);
				transactionIndexController["editTransaction"](1);
			});

			it("should remove the transaction from the list of transactions", (): void => {
				$uibModal.close(transaction);
				transactionIndexController["removeTransaction"].should.have.been.calledWith(1);
			});
		});

		describe("(transaction date is before the current batch", (): void => {
			it("should fetch a new transaction batch starting from the new transaction date", (): void => {
				transaction.transaction_date = subDays(transactionIndexController.firstTransactionDate, 1);
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.have.been.calledWith("next", subDays(transaction.transaction_date, 1), transaction.id);
			});
		});

		describe("(transaction date is after the current batch", (): void => {
			beforeEach((): void => {
				transaction.transaction_date = addDays(transactionIndexController.lastTransactionDate, 1);
				transactionIndexController["editTransaction"](1);
			});

			it("should not fetch a new transaction batch if we're already at the end", (): void => {
				transactionIndexController["atEnd"] = true;
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.not.have.been.called;
			});

			it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", (): void => {
				transactionIndexController["atEnd"] = false;
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.have.been.calledWith("prev", addDays(transaction.transaction_date as Date, 1), transaction.id);
			});
		});

		describe("transaction date is within the current batch, or we're at the end", (): void => {
			it("should not fetch a new transaction batch when the modal is closed", (): void => {
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				transactionIndexController.getTransactions.should.not.have.been.called;
			});

			it("should resort the transaction list when the modal is closed", (): void => {
				transaction.id = 999;
				transaction.transaction_date = subDays(startOfDay(new Date()), 1);
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				(transactionIndexController.transactions.pop() as Transaction).should.deep.equal(transaction);
			});

			it("should recalculate the running balances when the modal is closed", (): void => {
				transactionIndexController["editTransaction"]();
				$uibModal.close(transaction);
				transactionIndexController["updateRunningBalances"].should.have.been.called;
			});

			it("should focus the transaction when the modal is closed", (): void => {
				transactionIndexController["editTransaction"]();
				$uibModal.close(transaction);
				transactionIndexController["focusTransaction"].should.have.been.calledWith(transaction.id);
			});
		});

		it("should not change the transactions list when the modal is dismissed", (): void => {
			const originalTransactions = angular.copy(transactionIndexController.transactions);

			transactionIndexController["editTransaction"]();
			$uibModal.dismiss();
			transactionIndexController.transactions.should.deep.equal(originalTransactions);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			transactionIndexController["editTransaction"]();
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			transactionIndexController["editTransaction"]();
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("contextChanged", (): void => {
		let transaction: Transaction & {[contextField: string]: Entity;};

		beforeEach((): Transaction => (transaction = angular.copy(transactionIndexController.transactions[1]) as Transaction & {[contextField: string]: Entity;}));

		describe("(search mode)", (): void => {
			beforeEach((): TransactionIndexController => (transactionIndexController = controllerTest("TransactionIndexController", { contextModel: null, context: "Search" }) as TransactionIndexController));

			it("should return true when the transaction memo no longer contains the search query", (): void => {
				transaction.memo = "test memo";
				transactionIndexController["contextChanged"](transaction).should.be.true;
			});

			it("should return false when the transaction memo contains the search query", (): void => {
				transaction.memo = "test search";
				transactionIndexController["contextChanged"](transaction).should.be.false;
			});
		});

		describe("(context mode)", (): void => {
			const scenarios: {type: "payee" | "account" | "security" | "category"; field: (keyof BasicTransaction | keyof SecurityTransaction); contextFactory: () => Entity;}[] = [
				{ type: "account", field: "primary_account", contextFactory: createAccount },
				{ type: "payee", field: "payee", contextFactory: createPayee },
				{ type: "security", field: "security", contextFactory: createSecurity },
				{ type: "category", field: "category", contextFactory: createCategory },
				{ type: "category", field: "subcategory", contextFactory: (): Entity => createCategory({ parent: createCategory() }) }
			];
			let contextModels: {[type: string]: EntityModel;};

			beforeEach((): void => {
				contextModels = {
					account: accountModel,
					payee: contextModel,
					security: securityModel,
					category: categoryModel
				};
			});

			angular.forEach(scenarios, (scenario: {type: "payee" | "account" | "security" | "category"; field: string; contextFactory: () => Entity;}): void => {
				it(`should return true when the context type is ${scenario.type} and the transaction ${scenario.field} no longer matches the context`, (): void => {
					transactionIndexController = controllerTest("TransactionIndexController", { contextModel: contextModels[scenario.type], context: scenario.contextFactory() }) as TransactionIndexController;
					transaction[scenario.field] = scenario.contextFactory();
					transactionIndexController["contextChanged"](transaction).should.be.true;
				});

				it(`should return false when the context type is ${scenario.type} and the transaction ${scenario.field} matches the context`, (): void => {
					context = scenario.contextFactory();
					transactionIndexController = controllerTest("TransactionIndexController", { contextModel: contextModels[scenario.type], context }) as TransactionIndexController;
					transaction[scenario.field] = context;
					transactionIndexController["contextChanged"](transaction).should.be.false;
				});
			});

			it("should return false when the transaction field is undefined", (): void => {
				transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel as EntityModel }) as TransactionIndexController;
				delete transaction.primary_account;
				transactionIndexController["contextChanged"](transaction).should.be.false;
			});
		});
	});

	describe("deleteTransaction", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(transactionIndexController, "removeTransaction" as keyof TransactionIndexController);
		});

		it("should do nothing if the transaction can't be deleted", (): void => {
			sinon.stub(transactionIndexController, "isAllowed" as keyof TransactionIndexController).returns(false);
			transactionIndexController["deleteTransaction"](1);
			Boolean(ogTableNavigableService.enabled).should.be.true;
			$uibModal.open.should.not.have.been.called;
		});

		it("should disable navigation on the table", (): void => {
			transactionIndexController["deleteTransaction"](1);
			ogTableNavigableService.enabled.should.be.false;
		});

		it("should open the delete transaction modal with a transaction", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.deep.equal(transaction);
		});

		it("should remove the transaction from the transactions list when the modal is closed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.close(transaction);
			transactionIndexController["removeTransaction"].should.have.been.calledWith(1);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.close(transaction);
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("removeTransaction", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(transactionIndexController, "updateClosingBalance" as keyof TransactionIndexController);
		});

		it("should update the closing balance if the transaction was not focussed", (): void => {
			transactionIndexController["removeTransaction"](1);
			transactionIndexController["updateClosingBalance"].should.have.been.calledWith(transaction);
		});

		it("should remove the transaction from the transactions list", (): void => {
			transactionIndexController["removeTransaction"](1);
			transactionIndexController.transactions.should.not.include(transaction);
		});

		it("should transition to the parent state if the transaction was focussed", (): void => {
			$state.currentState("**.transaction");
			transactionIndexController["removeTransaction"](1);
			$state.go.should.have.been.calledWith("^");
		});
	});

	describe("updateClosingBalance", (): void => {
		it("should do nothing if the context doesn't have a closing balance property", (): void => {
			delete context.closing_balance;
			transactionIndexController = controllerTest("TransactionIndexController", { context }) as TransactionIndexController;
			transactionIndexController["updateClosingBalance"](createBasicTransaction({ amount: 1 }));
			transactionIndexController.should.not.have.property("closing_balance");
		});

		describe("(context has a closing balance property)", (): void => {
			let	transaction: Transaction | undefined,
					expected: number;

			beforeEach((): void => {
				transaction = createBasicTransaction({ amount: 1 });
				(transactionIndexController.context as Account).closing_balance = 0;
			});

			describe("(original transaction)", (): void => {
				it("should do nothing if undefined", (): void => {
					transaction = undefined;
					expected = 0;
				});

				it("should reduce the closing balance by the transaction amount when the direction is inflow", (): void => {
					(transaction as Transaction).direction = "inflow";
					expected = -1;
				});

				it("should increase the closing balance by the transaction amount when the direction is outflow", (): void => {
					(transaction as Transaction).direction = "outflow";
					expected = 1;
				});

				afterEach((): void => transactionIndexController["updateClosingBalance"](transaction as Transaction));
			});

			describe("(new transaction)", (): void => {
				it("should do nothing if undefined", (): void => {
					transaction = undefined;
					expected = 0;
				});

				it("should increase the closing balance by the transaction amount when the direction is inflow", (): void => {
					(transaction as Transaction).direction = "inflow";
					expected = 1;
				});

				it("should reduce the closing balance by the transaction amount when the direction is outflow", (): void => {
					(transaction as Transaction).direction = "outflow";
					expected = -1;
				});

				afterEach((): void => transactionIndexController["updateClosingBalance"](createBasicTransaction(), transaction as Transaction));
			});

			afterEach((): Chai.Assertion => (transactionIndexController.context as Account).closing_balance.should.equal(expected));
		});
	});

	describe("isAllowed", (): void => {
		let transaction: Transaction | SplitTransactionChild;

		beforeEach((): void => {
			sinon.stub(transactionIndexController, "promptToSwitchAccounts" as keyof TransactionIndexController);
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transaction.primary_account = createAccount();
		});

		describe("(not allowed)", (): void => {
			const scenarios: {action: "edit" | "delete"; type: TransactionType; message: string;}[] = [
				{ action: "edit", type: "Sub", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?" },
				{ action: "delete", type: "Sub", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?" },
				{ action: "edit", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?" },
				{ action: "delete", type: "Subtransfer", message: "This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?" },
				{ action: "edit", type: "Dividend", message: "This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?" },
				{ action: "edit", type: "SecurityInvestment", message: "This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?" }
			];

			angular.forEach(scenarios, (scenario: {action: "edit" | "delete"; type: TransactionType; message: string;}): void => {
				it(`should prompt to switch accounts when attempting to ${scenario.action} a ${scenario.type} transaction`, (): void => {
					transaction.transaction_type = scenario.type;
					transactionIndexController["isAllowed"](scenario.action, transaction);
					transactionIndexController["promptToSwitchAccounts"].should.have.been.calledWith(scenario.message, transaction);
				});

				it(`should return false when attempting to ${scenario.action} a ${scenario.type} transaction`, (): void => {
					transaction.transaction_type = scenario.type;
					transactionIndexController["isAllowed"](scenario.action, transaction).should.be.false;
				});
			});
		});

		describe("(allowed)", (): void => {
			const scenarios: {action: "edit" | "delete"; type: TransactionType; account_type?: "investment";}[] = [
				{ action: "edit", type: "Basic" },
				{ action: "delete", type: "Basic" },
				{ action: "edit", type: "Dividend", account_type: "investment" },
				{ action: "delete", type: "Dividend" },
				{ action: "edit", type: "SecurityInvestment", account_type: "investment" },
				{ action: "delete", type: "SecurityInvestment" }
			];

			angular.forEach(scenarios, (scenario: {action: "edit" | "delete"; type: TransactionType; account_type?: "investment";}): void => {
				it(`should not prompt to switch accounts when attempting to ${scenario.action} a ${scenario.type} transaction${undefined === scenario.account_type ? "" : ` from an ${scenario.account_type} acount`}`, (): void => {
					transaction.transaction_type = scenario.type;
					(transaction.primary_account as Account).account_type = undefined === scenario.account_type ? (transaction.primary_account as Account).account_type : scenario.account_type;
					transactionIndexController["isAllowed"](scenario.action, transaction);
					transactionIndexController["promptToSwitchAccounts"].should.not.have.been.called;
				});

				it(`should return true when attempting to ${scenario.action} a ${scenario.type} transaction${undefined === scenario.account_type ? "" : ` from an ${scenario.account_type} acount`}`, (): void => {
					transaction.transaction_type = scenario.type;
					(transaction.primary_account as Account).account_type = undefined === scenario.account_type ? (transaction.primary_account as Account).account_type : scenario.account_type;
					transactionIndexController["isAllowed"](scenario.action, transaction).should.be.true;
				});
			});
		});
	});

	describe("promptToSwitchAccounts", (): void => {
		let	message: string,
				transaction: Transaction;

		beforeEach((): void => {
			sinon.stub(transactionIndexController, "switchAccount");
			sinon.stub(transactionIndexController, "switchPrimaryAccount");
			message = "test message";
			transaction = angular.copy(transactionIndexController.transactions[1]);
			(transaction as TransferrableTransaction).account = createAccount();
			transaction.primary_account = createAccount();
			transactionIndexController["promptToSwitchAccounts"](message, transaction);
		});

		it("should disable navigation on the table", (): Chai.Assertion => ogTableNavigableService.enabled.should.be.false);

		it("should prompt the user to switch to the other account", (): void => {
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).confirm as OgModalConfirm).message.should.equal(message);
		});

		it("should switch to the other account when the modal is closed", (): void => {
			$uibModal.close();
			transactionIndexController.switchAccount.should.have.been.calledWith(null, transaction);
		});

		it("should switch to the primary account if there is no other account when the modal is closed", (): void => {
			(transaction as TransferrableTransaction).account = null;
			$uibModal.close();
			transactionIndexController.switchPrimaryAccount.should.have.been.calledWith(null, transaction);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			$uibModal.close();
			ogTableNavigableService.enabled.should.be.true;
		});

		it("should enable navigation on the table when the modal is dismissed", (): void => {
			$uibModal.dismiss();
			ogTableNavigableService.enabled.should.be.true;
		});
	});

	describe("tableActions.selectAction", (): void => {
		describe("(not reconciling)", (): void => {
			it("should edit a transaction", (): void => {
				sinon.stub(transactionIndexController, "editTransaction" as keyof TransactionIndexController);
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController["editTransaction"].should.have.been.calledWith(1);
			});
		});

		describe("(reconciling)", (): void => {
			beforeEach((): void => {
				transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel }) as TransactionIndexController;
				transactionIndexController.reconciling = true;
				sinon.stub(transactionIndexController, "toggleCleared");
			});

			it("should set the transaction status to Cleared if not already", (): void => {
				transactionIndexController.transactions[1].status = "";
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.transactions[1].status.should.equal("Cleared");
			});

			it("should clear the transaction status if set to Cleared", (): void => {
				transactionIndexController.transactions[1].status = "Cleared";
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.transactions[1].status.should.equal("");
			});

			it("should toggle the transaction's cleared status", (): void => {
				transactionIndexController.tableActions.selectAction(1);
				transactionIndexController.toggleCleared.should.have.been.calledWith(transactionIndexController.transactions[1]);
			});
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the transaction", (): void => {
			sinon.stub(transactionIndexController, "editTransaction" as keyof TransactionIndexController);
			transactionIndexController.tableActions.editAction(1);
			transactionIndexController["editTransaction"].should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a transaction", (): void => {
			sinon.stub(transactionIndexController, "editTransaction" as keyof TransactionIndexController);
			transactionIndexController.tableActions.insertAction();
			transactionIndexController["editTransaction"].should.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a transaction", (): void => {
			sinon.stub(transactionIndexController, "deleteTransaction" as keyof TransactionIndexController);
			transactionIndexController.tableActions.deleteAction(1);
			transactionIndexController["deleteTransaction"].should.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a transaction when no transaction is currently focussed", (): void => {
			transactionIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith(".transaction", { transactionId: 2 });
		});

		it("should focus a transaction when another transaction is currently focussed", (): void => {
			$state.currentState("**.transaction");
			transactionIndexController.tableActions.focusAction(1);
			$state.go.should.have.been.calledWith("^.transaction", { transactionId: 2 });
		});
	});

	describe("getTransactions", (): void => {
		let fromDate: Date;

		beforeEach((): void => {
			sinon.stub(transactionIndexController, "processTransactions" as keyof TransactionIndexController);
			fromDate = new Date();
		});

		it("should show a loading indicator in the specified direction", (): void => {
			(transactionIndexController.context as Entity).id = -1;
			transactionIndexController.getTransactions("next");
			transactionIndexController.loading.next.should.be.true;
		});

		it("should fetch transactions before the first transaction date when going backwards", (): void => {
			const firstTransactionDate: Date = transactionIndexController.transactions[0].transaction_date as Date;

			transactionIndexController.getTransactions("prev");
			transactionModel.all.should.have.been.calledWith("/payees/1", firstTransactionDate, "prev");
		});

		it("should fetch transactions after the last transaction date when going forwards", (): void => {
			const lastTransactionDate: Date = transactionIndexController.transactions[transactionIndexController.transactions.length - 1].transaction_date as Date;

			transactionIndexController.getTransactions("next");
			transactionModel.all.should.have.been.calledWith("/payees/1", lastTransactionDate, "next");
		});

		it("should fetch transactions without a from date in either direction if there are no transactions", (): void => {
			transactionIndexController.transactions = [];
			transactionIndexController.getTransactions("prev");
			transactionModel.all.should.have.been.calledWith("/payees/1");
		});

		it("should fetch transactions from a specified transaction date in either direction", (): void => {
			transactionIndexController.getTransactions("prev", fromDate);
			transactionModel.all.should.have.been.calledWith("/payees/1", fromDate);
		});

		it("should search for transactions from a specified date in either direction", (): void => {
			transactionIndexController = controllerTest("TransactionIndexController", { contextModel: null, context: "search" }) as TransactionIndexController;
			transactionIndexController.getTransactions("prev", fromDate);
			transactionModel.query.should.have.been.calledWith("search", fromDate);
		});

		it("should process the fetched transactions", (): void => {
			transactionIndexController.getTransactions("prev", fromDate, 1);
			transactionIndexController["processTransactions"].should.have.been.calledWith(transactionBatch, fromDate, 1);
		});

		it("should hide the loading indicator after fetching the transacactions", (): void => {
			transactionIndexController.getTransactions("prev");
			transactionIndexController.loading.prev.should.be.false;
		});
	});

	describe("processTransactions", (): void => {
		beforeEach((): void => {
			delete transactionIndexController["openingBalance"];
			delete transactionIndexController.transactions;
			transactionIndexController["atEnd"] = false;
			delete transactionIndexController.firstTransactionDate;
			delete transactionIndexController.lastTransactionDate;
			sinon.stub(transactionIndexController, "updateRunningBalances" as keyof TransactionIndexController);
			sinon.stub(transactionIndexController, "focusTransaction" as keyof TransactionIndexController);
		});

		it("should do nothing if no transactions to process", (): void => {
			transactionBatch.transactions = [];
			transactionIndexController["processTransactions"](transactionBatch);
			(undefined === transactionIndexController["openingBalance"]).should.be.true;
		});

		it("should make the opening balance of the batch available to the view", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController["openingBalance"] = transactionBatch.openingBalance;
		});

		it("should make the transactions available to the view", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController.transactions = transactionBatch.transactions;
		});

		it("should set a flag if we've reached the end", (): void => {
			transactionIndexController["processTransactions"](transactionBatch, new Date());
			transactionIndexController["atEnd"].should.be.true;
		});

		it("should set a flag if a from date was not specified", (): void => {
			transactionBatch.atEnd = false;
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController["atEnd"].should.be.true;
		});

		it("should make the first transaction date available to the view", (): void => {
			const firstTransactionDate: Date = transactionBatch.transactions[0].transaction_date as Date;

			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController.firstTransactionDate.should.equal(firstTransactionDate);
		});

		it("should make the last transaction date available to the view", (): void => {
			const lastTransactionDate: Date = transactionBatch.transactions[transactionBatch.transactions.length - 1].transaction_date as Date;

			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController.lastTransactionDate.should.equal(lastTransactionDate);
		});

		it("should calculate the running balances", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController["updateRunningBalances"].should.have.been.called;
		});

		it("should focus the transaction row for a specified transaction", (): void => {
			transactionIndexController["processTransactions"](transactionBatch, undefined, 1);
			transactionIndexController["focusTransaction"].should.have.been.calledWith(1);
		});

		it("should update the reconciled totals when reconciling", (): void => {
			transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel }) as TransactionIndexController;
			sinon.stub(transactionIndexController, "updateReconciledTotals" as keyof TransactionIndexController);
			transactionIndexController.reconciling = true;
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController["updateReconciledTotals"].should.have.been.called;
		});
	});

	describe("updateRunningBalances", (): void => {
		it("should do nothing for investment accounts", (): void => {
			(transactionIndexController.context as Account).account_type = "investment";
			transactionIndexController["updateRunningBalances"]();
			transactionIndexController.transactions.should.deep.equal(transactionBatch.transactions);
		});

		it("should calculate a running balance on each transaction", (): void => {
			transactionIndexController["updateRunningBalances"]();
			(transactionIndexController.transactions.pop() as Transaction).balance.should.equal(95);
		});
	});

	describe("focusTransaction", (): void => {
		beforeEach((): SinonStub => (transactionIndexController.tableActions.focusRow = sinon.stub()));

		it("should do nothing when the specific transaction row could not be found", (): void => {
			transactionIndexController["focusTransaction"](999).should.be.NaN;
			(transactionIndexController.tableActions as OgTableActionHandlers).focusRow.should.not.have.been.called;
		});

		it("should focus the transaction row for the specified transaction", (): void => {
			const targetIndex: number = transactionIndexController["focusTransaction"](1);

			$timeout.flush();
			(transactionIndexController.tableActions as OgTableActionHandlers).focusRow.should.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified transaction", (): void => {
			const targetIndex: number = transactionIndexController["focusTransaction"](1);

			targetIndex.should.equal(0);
		});
	});

	describe("toggleShowAllDetails", (): void => {
		it("should update the show all details setting", (): void => {
			transactionIndexController.toggleShowAllDetails(true);
			transactionModel.showAllDetails.should.have.been.calledWith(true);
		});

		it("should set a flag to indicate that we're showing all details", (): void => {
			transactionIndexController.showAllDetails = false;
			transactionIndexController.toggleShowAllDetails(true);
			transactionIndexController.showAllDetails.should.be.true;
		});
	});

	describe("(account context)", (): void => {
		beforeEach((): TransactionIndexController => (transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel }) as TransactionIndexController));

		it("should set a flag to enable reconciling", (): Chai.Assertion => transactionIndexController.reconcilable.should.be.true);

		it("should fetch the unreconciled only setting for the current account", (): Chai.Assertion => accountModel.isUnreconciledOnly.should.have.been.calledWith((transactionIndexController.context as Entity).id));

		describe("toggleUnreconciledOnly", (): void => {
			let	direction: TransactionFetchDirection | null,
					fromDate: Date,
					transactionIdToFocus: number;

			beforeEach((): void => {
				transactionIndexController.unreconciledOnly = false;
				sinon.stub(transactionIndexController, "getTransactions");
				direction = "next";
				fromDate = new Date();
				transactionIdToFocus = 1;
			});

			it("should do nothing if we're currently reconciling", (): void => {
				transactionIndexController.reconciling = true;
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				accountModel.unreconciledOnly.should.not.have.been.called;
			});

			it("should update the unreconciled only setting for the current account", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				accountModel.unreconciledOnly.should.have.been.calledWith((transactionIndexController.context as Entity).id, true);
			});

			it("should set a flag to indicate that we're showing unreconciled transactions only", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				transactionIndexController.unreconciledOnly.should.be.true;
			});

			it("should clear the list of transactions", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				transactionIndexController.transactions.should.be.empty;
			});

			it("should refetch a batch of transactions in the specified direction", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, direction as TransactionFetchDirection, fromDate, transactionIdToFocus);
				transactionIndexController.getTransactions.should.have.been.calledWith(direction, fromDate, transactionIdToFocus);
			});

			it("should refetch a batch of transactions in the previous direction if a direction is not specified", (): void => {
				direction = null;
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				transactionIndexController.getTransactions.should.have.been.calledWith("prev");
			});
		});

		describe("save", (): void => {
			let contextId: number;

			beforeEach((): void => {
				contextId = 1;
				(transactionIndexController.context as Entity).id = contextId;
				transactionIndexController.reconciling = true;
				sinon.stub(transactionIndexController, "getTransactions");
				transactionIndexController.save();
			});

			it("should update all cleared transactions to reconciled", (): Chai.Assertion => accountModel.reconcile.should.have.been.calledWith(contextId));

			it("should cleared the account's closing balance", (): Chai.Assertion => $window.localStorage.removeItem.should.have.been.calledWith("lootClosingBalance-1"));

			it("should exit reconcile mode", (): Chai.Assertion => transactionIndexController.reconciling.should.be.false);

			it("should clear the list of transactions", (): void => {
				transactionIndexController.transactions.should.be.an("array");
				transactionIndexController.transactions.should.be.empty;
			});

			it("should refresh the list of transactions", (): Chai.Assertion => transactionIndexController.getTransactions.should.have.been.calledWith("prev"));
		});

		describe("cancel", (): void => {
			it("should exit reconcile mode", (): void => {
				transactionIndexController.reconciling = true;
				transactionIndexController.cancel();
				transactionIndexController.reconciling.should.be.false;
			});
		});

		describe("reconcile", (): void => {
			it("should do nothing if we're currently reconciling", (): void => {
				transactionIndexController.reconciling = true;
				transactionIndexController.reconcile();
				$uibModal.open.should.not.have.been.called;
			});

			describe("(not already reconciling)", (): void => {
				beforeEach((): void => {
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.reconciling = false;
					transactionIndexController.reconcile();
				});

				it("should disable navigation on the table", (): Chai.Assertion => ogTableNavigableService.enabled.should.be.false);

				it("should prompt the user for the accounts closing balance", (): void => {
					$uibModal.open.should.have.been.called;
					(($uibModal.resolves as UibModalMockResolves).account as Account).should.deep.equal(transactionIndexController.context);
				});

				it("should make the closing balance available to the view when the modal is closed", (): void => {
					const closingBalance = 100;

					$uibModal.close(closingBalance);
					transactionIndexController["closingBalance"].should.equal(closingBalance);
				});

				it("should refetch the list of unreconciled transactions when the modal is closed", (): void => {
					$uibModal.close();
					transactionIndexController.toggleUnreconciledOnly.should.have.been.calledWith(true);
				});

				it("should enter reconcile mode when the modal is closed", (): void => {
					$uibModal.close();
					transactionIndexController.reconciling.should.be.true;
				});

				it("should enable navigation on the table when the modal is closed", (): void => {
					$uibModal.close();
					ogTableNavigableService.enabled.should.be.true;
				});

				it("should enable navigation on the table when the modal is dismissed", (): void => {
					$uibModal.dismiss();
					ogTableNavigableService.enabled.should.be.true;
				});
			});
		});

		describe("updateReconciledTotals", (): void => {
			beforeEach((): void => {
				transactionIndexController["openingBalance"] = 100.002;
				transactionIndexController["closingBalance"] = 300.008;
				transactionIndexController["updateReconciledTotals"]();
			});

			it("should set the reconcile target to the difference between the opening and closing balances", (): Chai.Assertion => transactionIndexController.reconcileTarget.should.equal(200.01));

			it("should set the cleared total to the sum of all cleared transaction amounts", (): Chai.Assertion => transactionIndexController.clearedTotal.should.equal(2));

			it("should set the uncleared total to the difference between the cleared total and the reconcile target", (): Chai.Assertion => transactionIndexController.unclearedTotal.should.equal(198.01));
		});

		describe("toggleCleared", (): void => {
			let	transaction: Transaction;

			beforeEach((): void => {
				transaction = createBasicTransaction();
				sinon.stub(transactionIndexController, "updateReconciledTotals" as keyof TransactionIndexController);
				transactionIndexController.toggleCleared(transaction);
			});

			it("should update the transaction status", (): Chai.Assertion => transactionModel.updateStatus.should.have.been.calledWith("/accounts/1", transaction.id, transaction.status));

			it("should update the reconciled totals", (): Chai.Assertion => transactionIndexController["updateReconciledTotals"].should.have.been.called);
		});
	});

	describe("toggleSubtransactions", (): void => {
		let	event: JQueryMouseEventObjectMock,
				transaction: SplitTransaction;

		beforeEach((): void => {
			event = { cancelBubble: false };
			transaction = createSplitTransaction({ id: -1, showSubtransactions: true });
		});

		it("should toggle a flag on the transaction indicating whether subtransactions are shown", (): void => {
			transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
			transaction.showSubtransactions.should.be.false;
		});

		it("should do nothing if we're not showing subtransactions", (): void => {
			transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
			transactionModel.findSubtransactions.should.not.have.been.called;
		});

		describe("(on shown)", (): void => {
			beforeEach((): void => {
				transaction.showSubtransactions = false;
				transaction.loadingSubtransactions = false;
				delete transaction.subtransactions;
			});

			it("should show a loading indicator", (): void => {
				transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
				transaction.showSubtransactions.should.be.true;
				transaction.loadingSubtransactions.should.be.true;
			});

			it("should clear the subtransactions for the transaction", (): void => {
				transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
				transaction.subtransactions.should.be.an("array");
				transaction.subtransactions.should.be.empty;
			});

			it("should fetch the subtransactions", (): void => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
				transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
			});

			it("should update the transaction with it's subtransactions", (): void => {
				const subtransactions = [
					createSubtransferTransaction({ id: 1 }),
					createSubtransaction({ id: 2 }),
					createSubtransaction({ id: 3 })
				];

				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
				transaction.subtransactions.should.deep.equal(subtransactions);
			});

			it("should hide the loading indicator", (): void => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
				transaction.loadingSubtransactions.should.be.false;
			});
		});

		it("should prevent the event from bubbling", (): void => {
			transactionIndexController.toggleSubtransactions(event as JQueryMouseEventObject, transaction);
			(event.cancelBubble as boolean).should.be.true;
		});
	});

	describe("flag", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transactionIndexController.flag(1);
		});

		it("should disable navigation on the table", (): Chai.Assertion => ogTableNavigableService.enabled.should.be.false);

		it("should show the flag modal for the transaction", (): void => {
			$uibModal.open.should.have.been.called;
			(($uibModal.resolves as UibModalMockResolves).transaction as Transaction).should.deep.equal(transaction);
		});

		it("should update the transaction in the list of transactions when the modal is closed", (): void => {
			transaction.flag = "test flag";
			$uibModal.close(transaction);
			transactionIndexController.transactions[1].should.deep.equal(transaction);
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

	describe("switchTo", (): void => {
		let	transaction: SplitTransactionChild,
				stateParams: {id: number; transactionId?: number | null;},
				$event: EventMock;

		beforeEach((): void => {
			transaction = createSubtransferTransaction({ id: 2, parent_id: 1 });

			stateParams = {
				id: 3,
				transactionId: transaction.id
			};

			$event = { stopPropagation: sinon.stub() };
		});

		it("should transition to the specified state passing the transaction id", (): void => {
			transaction.parent_id = null;
			transactionIndexController["switchTo"](null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should transition to the specified state passing the parent transaction id if present", (): void => {
			stateParams.transactionId = transaction.parent_id;
			transactionIndexController["switchTo"](null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should transition to the specified state passing the transaction id for a Subtransaction", (): void => {
			transaction.transaction_type = "Sub";
			transactionIndexController["switchTo"](null, "state", stateParams.id, transaction);
			$state.go.should.have.been.calledWith("root.state.transactions.transaction", stateParams);
		});

		it("should stop the event from propagating if present", (): void => {
			transactionIndexController["switchTo"]($event as Event, "state", stateParams.id, transaction);
			($event.stopPropagation as SinonStub).should.have.been.called;
		});
	});

	describe("switchToAccount", (): void => {
		let	id: number,
				transaction: Transaction;

		beforeEach((): void => {
			sinon.stub(transactionIndexController, "switchTo" as keyof TransactionIndexController);
			id = 1;
			transaction = createBasicTransaction();
		});

		it("should not toggle the unreconciled only setting for the account if the transaction is not reconciled", (): void => {
			transactionIndexController["switchToAccount"](null, id, transaction);
			accountModel.unreconciledOnly.should.not.have.been.called;
		});

		it("should toggle the unreconciled only setting for the account if the transaction is reconciled", (): void => {
			transaction.status = "Reconciled";
			transactionIndexController["switchToAccount"](null, id, transaction);
			accountModel.unreconciledOnly.should.have.been.calledWith(id, false);
		});

		it("should transition to the specified state", (): void => {
			const event: EventMock = {};

			transactionIndexController["switchToAccount"](event as Event, id, transaction);
			transactionIndexController["switchTo"].should.have.been.calledWith(event, "accounts.account", id, transaction);
		});
	});

	describe("switchAccount", (): void => {
		it("should switch to the other side of the transaction", (): void => {
			const event: EventMock = {},
						transaction: TransferTransaction = createTransferTransaction();

			sinon.stub(transactionIndexController, "switchToAccount" as keyof TransactionIndexController);
			transactionIndexController["switchAccount"](event as Event, transaction);
			transactionIndexController["switchToAccount"].should.have.been.calledWith(event, (transaction.account as Account).id, transaction);
		});
	});

	describe("switchPrimaryAccount", (): void => {
		it("should switch to the primary account of the transaction", (): void => {
			const event: EventMock = {},
						transaction: TransferTransaction = createTransferTransaction();

			sinon.stub(transactionIndexController, "switchToAccount" as keyof TransactionIndexController);
			transactionIndexController.switchPrimaryAccount(event as Event, transaction);
			transactionIndexController["switchToAccount"].should.have.been.calledWith(event, transaction.primary_account.id, transaction);
		});
	});

	describe("switchPayee", (): void => {
		it("should switch to the payee of the transaction", (): void => {
			const event: EventMock = {},
						transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(transactionIndexController, "switchTo" as keyof TransactionIndexController);
			transactionIndexController.switchPayee(event as Event, transaction);
			transactionIndexController["switchTo"].should.have.been.calledWith(event, "payees.payee", (transaction.payee as Payee).id, transaction);
		});
	});

	describe("switchSecurity", (): void => {
		it("should switch to the security of the transaction", (): void => {
			const event: EventMock = {},
						transaction: SecurityHoldingTransaction = createSecurityHoldingTransaction();

			sinon.stub(transactionIndexController, "switchTo" as keyof TransactionIndexController);
			transactionIndexController.switchSecurity(event as Event, transaction);
			transactionIndexController["switchTo"].should.have.been.calledWith(event, "securities.security", (transaction.security as Security).id, transaction);
		});
	});

	describe("switchCategory", (): void => {
		it("should switch to the category of the transaction", (): void => {
			const event: EventMock = {},
						transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(transactionIndexController, "switchTo" as keyof TransactionIndexController);
			transactionIndexController.switchCategory(event as Event, transaction);
			transactionIndexController["switchTo"].should.have.been.calledWith(event, "categories.category", (transaction.category as Category).id, transaction);
		});
	});

	describe("switchSubcategory", (): void => {
		it("should switch to the subcategory of the transaction", (): void => {
			const event: EventMock = {},
						transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(transactionIndexController, "switchTo" as keyof TransactionIndexController);
			transactionIndexController.switchSubcategory(event as Event, transaction);
			transactionIndexController["switchTo"].should.have.been.calledWith(event, "categories.category", (transaction.subcategory as Category).id, transaction);
		});
	});

	describe("transitionSuccessHandler", (): void => {
		let	transactionId: number,
				focusTransactionStub: SinonStub;

		beforeEach((): SinonStub => (focusTransactionStub = sinon.stub(transactionIndexController, "focusTransaction" as keyof TransactionIndexController).returns(1)));

		it("should ensure the transaction is focussed when the transaction id state param changes", (): void => {
			transactionId = 2;
			transactionIndexController["transitionSuccessHandler"](transactionId);
			transactionIndexController["focusTransaction"].should.have.been.calledWith(transactionId);
		});

		describe("(transaction not found)", (): void => {
			beforeEach((): void => {
				sinon.stub(transactionIndexController, "getTransactions");
				focusTransactionStub.withArgs(3).returns(NaN);
				transactionId = 3;
			});

			it("should fetch the transaction details", (): void => {
				transactionIndexController["transitionSuccessHandler"](transactionId);
				transactionModel.find.should.have.been.calledWith(transactionId);
			});

			describe("(showing unreconciled only)", (): void => {
				it("should toggle to show all transactions", (): void => {
					const transactionDate: Date = subDays(startOfDay(new Date()), 1),
								direction: TransactionFetchDirection = "next";

					transactionIndexController = controllerTest("TransactionIndexController", { contextModel: accountModel }) as TransactionIndexController;
					sinon.stub(transactionIndexController, "focusTransaction" as keyof TransactionIndexController).returns(NaN);
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.unreconciledOnly = true;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					transactionIndexController.toggleUnreconciledOnly.should.have.been.calledWith(false, direction, transactionDate, transactionId);
				});
			});

			describe("(transaction date is before the current batch)", (): void => {
				it("should fetch a new transaction batch starting from the new transaction date", (): void => {
					const fromDate: Date = subDays(startOfDay(new Date()), 2);

					transactionIndexController.firstTransactionDate = startOfDay(new Date());
					transactionIndexController["transitionSuccessHandler"](transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith("next", fromDate);
				});
			});

			describe("(transaction date is after the current batch)", (): void => {
				it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", (): void => {
					const fromDate: Date = startOfDay(new Date());

					transactionIndexController.lastTransactionDate = subDays(startOfDay(new Date()), 2);
					transactionIndexController["atEnd"] = false;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith("prev", fromDate);
				});

				it("should fetch a new transaction batch for the current transaction date if we're already at the end", (): void => {
					const fromDate: Date = subDays(startOfDay(new Date()), 1),
								direction: TransactionFetchDirection = "next";

					transactionIndexController.lastTransactionDate = subDays(startOfDay(new Date()), 2);
					transactionIndexController["atEnd"] = true;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					transactionIndexController.getTransactions.should.have.been.calledWith(direction, fromDate);
				});
			});
		});
	});
});
