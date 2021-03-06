import {
	Account,
	AccountType
} from "accounts/types";
import {
	CategorisableTransaction,
	SecurityTransactionType,
	SplitTransactionChild,
	SplitTransactionType,
	SubcategorisableTransaction,
	Subtransaction,
	SubtransactionType,
	TransactionDirection,
	TransactionFlag,
	TransactionStatus,
	TransactionType
} from "transactions/types";
import {
	Category,
	DisplayCategory,
	PsuedoCategory
} from "categories/types";
import {
	ScheduleFrequency,
	ScheduledBasicTransaction,
	ScheduledSecurityHoldingTransaction,
	ScheduledSecurityInvestmentTransaction,
	ScheduledSplitTransaction,
	ScheduledTransaction,
	ScheduledTransferTransaction
} from "schedules/types";
import {
	addMonths,
	addQuarters,
	addWeeks,
	addYears,
	startOfDay
} from "date-fns";
import {
	createScheduledBasicTransaction,
	createScheduledSplitTransaction,
	createScheduledTransferTransaction
} from "mocks/schedules/factories";
import {
	createSubtransaction,
	createSubtransferTransaction
} from "mocks/transactions/factories";
import sinon, { SinonStub } from "sinon";
import { AccountModelMock } from "mocks/accounts/types";
import { CategoryModelMock } from "mocks/categories/types";
import { ControllerTestFactory } from "mocks/types";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import { NewOrExistingEntity } from "loot/types";
import { Payee } from "payees/types";
import { PayeeModelMock } from "mocks/payees/types";
import ScheduleEditController from "schedules/controllers/edit";
import { ScheduleModelMock } from "mocks/schedules/types";
import { Security } from "securities/types";
import { SecurityModelMock } from "mocks/securities/types";
import { TransactionModelMock } from "mocks/transactions/types";
import { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "mocks/accounts/factories";
import createCategory from "mocks/categories/factories";
import createPayee from "mocks/payees/factories";
import createSecurity from "mocks/securities/factories";

describe("ScheduleEditController", (): void => {
	let	scheduleEditController: ScheduleEditController,
			controllerTest: ControllerTestFactory,
			$uibModalInstance: UibModalInstanceMock,
			$timeout: angular.ITimeoutService,
			payeeModel: PayeeModelMock,
			securityModel: SecurityModelMock,
			categoryModel: CategoryModelMock,
			accountModel: AccountModelMock,
			transactionModel: TransactionModelMock,
			scheduleModel: ScheduleModelMock,
			schedule: ScheduledTransaction;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "lootSchedules", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModalInstance", "payeeModel", "securityModel", "categoryModel", "accountModel", "transactionModel", "scheduleModel", "schedule"])));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_controllerTest_: ControllerTestFactory, _$uibModalInstance_: UibModalInstanceMock, _$timeout_: angular.ITimeoutService, _payeeModel_: PayeeModelMock, _securityModel_: SecurityModelMock, _categoryModel_: CategoryModelMock, _accountModel_: AccountModelMock, _transactionModel_: TransactionModelMock, _scheduleModel_: ScheduleModelMock, _schedule_: ScheduledTransaction): void => {
		controllerTest = _controllerTest_;
		$uibModalInstance = _$uibModalInstance_;
		$timeout = _$timeout_;
		payeeModel = _payeeModel_;
		securityModel = _securityModel_;
		categoryModel = _categoryModel_;
		accountModel = _accountModel_;
		transactionModel = _transactionModel_;
		scheduleModel = _scheduleModel_;
		schedule = _schedule_;
		scheduleEditController = controllerTest("ScheduleEditController") as ScheduleEditController;
	}));

	describe("when a schedule is provided", (): void => {
		let originalSchedule: ScheduledTransaction;

		beforeEach((): void => {
			originalSchedule = angular.copy(schedule);
			schedule.id = null;
			schedule.transaction_date = schedule.next_due_date;
		});

		it("should make the passed schedule available to the view", (): Chai.Assertion => scheduleEditController.transaction.should.deep.equal(schedule));

		it("should default the transaction type to Basic if not specified", (): void => {
			delete schedule.transaction_type;
			scheduleEditController = controllerTest("ScheduleEditController") as ScheduleEditController;
			scheduleEditController.transaction.transaction_type.should.equal("Basic");
		});

		it("should default the next due date to the current day if not specified", (): void => {
			delete schedule.next_due_date;
			scheduleEditController = controllerTest("ScheduleEditController") as ScheduleEditController;
			scheduleEditController.transaction.next_due_date.should.deep.equal(startOfDay(new Date()));
		});

		it("should set the mode to Enter Transaction", (): Chai.Assertion => scheduleEditController.mode.should.equal("Enter Transaction"));

		it("should make a copy of the transaction as schedule available to the view", (): void => {
			(scheduleEditController.schedule.id as number).should.not.be.null;
			scheduleEditController.schedule.should.deep.equal(originalSchedule);
		});

		it("should clear the transaction id", (): Chai.Assertion => (null === scheduleEditController.transaction.id).should.be.true);

		it("should set the transaction date to the next due date", (): Chai.Assertion => (scheduleEditController.transaction.transaction_date as Date).should.deep.equal(schedule.next_due_date));
	});

	describe("when a schedule is not provided", (): void => {
		let transaction: Partial<ScheduledBasicTransaction>;

		beforeEach((): void => {
			transaction = {
				id: null,
				transaction_type: "Basic",
				next_due_date: startOfDay(new Date()),
				autoFlag: false
			};
			scheduleEditController = controllerTest("ScheduleEditController", { schedule: undefined }) as ScheduleEditController;
		});

		it("should make an empty transaction object available to the view", (): Chai.Assertion => scheduleEditController.transaction.should.deep.equal(transaction));

		it("should set the mode to Add Schedule", (): Chai.Assertion => scheduleEditController.mode.should.equal("Add Schedule"));

		it("should make an alias of the transaction as schedule available to the view", (): Chai.Assertion => scheduleEditController.schedule.should.equal(scheduleEditController.transaction));
	});

	it("should set the auto-flag property when a flag is present", (): void => {
		schedule.flag = "Test flag";
		scheduleEditController = controllerTest("ScheduleEditController") as ScheduleEditController;
		scheduleEditController.schedule.autoFlag.should.be.true;
	});

	it("should not set the auto-flag property when a flag is absent", (): Chai.Assertion => scheduleEditController.schedule.autoFlag.should.be.false);

	it("should set the flag memo to null when the flag memo is '(no memo)'", (): void => {
		schedule.flag = "(no memo)";
		scheduleEditController = controllerTest("ScheduleEditController") as ScheduleEditController;
		(null === scheduleEditController.schedule.flag).should.be.true;
	});

	it("should prefetch the payees list to populate the cache", (): Chai.Assertion => payeeModel.all.should.have.been.called);

	describe("payees", (): void => {
		let payees: angular.IPromise<Payee[]>;

		beforeEach((): angular.IPromise<Payee[]> => (payees = scheduleEditController.payees("a", 3)));

		it("should fetch the list of payees", (): Chai.Assertion => payeeModel.all.should.have.been.called);

		it("should return a filtered & limited list of payees", async (): Promise<Chai.Assertion> => (await payees).should.deep.equal([
			createPayee({ id: 1, name: "aa" }),
			createPayee({ id: 4, name: "ba" }),
			createPayee({ id: 5, name: "ab" })
		]));
	});

	describe("securities", (): void => {
		let securities: angular.IPromise<Security[]>;

		beforeEach((): angular.IPromise<Security[]> => (securities = scheduleEditController.securities("a", 3)));

		it("should fetch the list of securities", (): Chai.Assertion => securityModel.all.should.have.been.called);

		it("should return a filtered & limited list of securities", async (): Promise<Chai.Assertion> => (await securities).should.deep.equal([
			createSecurity({ id: 1, name: "aa", closing_balance: 1.006, code: "A", current_holding: 1 }),
			createSecurity({ id: 4, name: "ba", closing_balance: 4, code: "D", current_holding: 1 }),
			createSecurity({ id: 5, name: "ab", closing_balance: 5, code: "E", current_holding: 1 })
		]));
	});

	describe("categories", (): void => {
		let categories: angular.IPromise<DisplayCategory[]> | DisplayCategory[],
				parentCategory: Category;

		beforeEach((): Category => (parentCategory = createCategory({ id: 1 })));

		it("should return an empty array if the parent category is new", (): void => {
			delete parentCategory.id;
			categories = scheduleEditController.categories("a", 3, parentCategory);
			categories.should.be.an("array");
			categories.should.be.empty;
		});

		describe("(parent categories)", (): void => {
			it("should fetch the list of parent categories", (): void => {
				categories = scheduleEditController.categories("a", 3);
				categoryModel.all.should.have.been.calledWith(null);
			});

			it("should include transfer categories", async (): Promise<Chai.Assertion> => (await scheduleEditController.categories("a", 5)).should.deep.equal([
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" },
				createCategory({ id: 1, name: "aa", num_children: 2, children: [
					createCategory({ id: 10, name: "aa_1", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					}),
					createCategory({ id: 11, name: "aa_2", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					})
				] }),
				createCategory({ id: 4, name: "ba", direction: "outflow", children: [] }),
				createCategory({ id: 5, name: "ab", children: [] })
			]));

			it("should include split categories if requested", async (): Promise<Chai.Assertion> => (await scheduleEditController.categories("a", 7, null, true)).should.deep.equal([
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" },
				{ id: "Payslip", name: "Payslip" },
				{ id: "LoanRepayment", name: "Loan Repayment" },
				createCategory({ id: 1, name: "aa", num_children: 2, children: [
					createCategory({ id: 10, name: "aa_1", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					}),
					createCategory({ id: 11, name: "aa_2", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					})
				] }),
				createCategory({ id: 4, name: "ba", direction: "outflow", children: [] }),
				createCategory({ id: 5, name: "ab", children: [] })
			]));
		});

		describe("(subcategories)", (): void => {
			it("should fetch the subcategories for the specified parent category", (): void => {
				categories = scheduleEditController.categories("a", 3, parentCategory);
				categoryModel.all.should.have.been.calledWith(1);
			});

			it("should eventually return a filtered & limited list of subcategories", async (): Promise<Chai.Assertion> => (await scheduleEditController.categories("a", 3, parentCategory)).should.deep.equal([
				createCategory({ id: 1, name: "aa", num_children: 2, children: [
					createCategory({ id: 10, name: "aa_1", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					}),
					createCategory({ id: 11, name: "aa_2", parent_id: 1, parent:
						createCategory({ id: 1, name: "aa", num_children: 2 })
					})
				] }),
				createCategory({ id: 4, name: "ba", direction: "outflow", children: [] }),
				createCategory({ id: 5, name: "ab", children: [] })
			]));
		});
	});

	describe("investmentCategories", (): void => {
		it("should return the full list of investment categories when a filter is not specified", (): Chai.Assertion => scheduleEditController.investmentCategories().should.deep.equal([
			{ id: "Buy", name: "Buy" },
			{ id: "Sell", name: "Sell" },
			{ id: "DividendTo", name: "Dividend To" },
			{ id: "AddShares", name: "Add Shares" },
			{ id: "RemoveShares", name: "Remove Shares" },
			{ id: "TransferTo", name: "Transfer To" },
			{ id: "TransferFrom", name: "Transfer From" }
		]));

		it("should return a filtered list of investment categories when a filter is specified", (): Chai.Assertion => scheduleEditController.investmentCategories("a").should.deep.equal([
			{ id: "AddShares", name: "Add Shares" },
			{ id: "RemoveShares", name: "Remove Shares" },
			{ id: "TransferTo", name: "Transfer To" },
			{ id: "TransferFrom", name: "Transfer From" }
		]));
	});

	describe("isString", (): void => {
		it("should return false if the object is not a string", (): Chai.Assertion => scheduleEditController.isString({}).should.be.false);

		it("should return false if the object is an empty string", (): Chai.Assertion => scheduleEditController.isString("").should.be.false);

		it("should return true if the object is a string and is not empty", (): Chai.Assertion => scheduleEditController.isString("test").should.be.true);
	});

	describe("payeeSelected", (): void => {
		let	payee: Payee,
				primaryAccount: Account;

		beforeEach((): void => {
			scheduleEditController.transaction.id = null;
			payee = createPayee();
			primaryAccount = createAccount();
			scheduleEditController.mode = "Add Schedule";
			(scheduleEditController.transaction as ScheduledBasicTransaction).payee = payee;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(scheduleEditController, "getSubtransactions" as keyof ScheduleEditController);
			sinon.stub(scheduleEditController, "useLastTransaction" as keyof ScheduleEditController);
		});

		it("should do nothing when editing an existing schedule", (): void => {
			scheduleEditController.transaction.id = 1;
			(scheduleEditController.transaction as ScheduledBasicTransaction).payee = payee;
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected payee is not an existing payee", (): void => {
			((scheduleEditController.transaction as ScheduledBasicTransaction).payee as NewOrExistingEntity) = "payee";
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", (): void => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			((scheduleEditController.transaction as ScheduledBasicTransaction).payee as Payee).id = -1;
			scheduleEditController.payeeSelected();
			scheduleEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected payee", (): void => {
			scheduleEditController.payeeSelected();
			payeeModel.findLastTransaction.should.have.been.calledWith(payee.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			scheduleEditController.payeeSelected();
			scheduleEditController["getSubtransactions"].should.have.been.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			scheduleEditController.payeeSelected();
			scheduleEditController["useLastTransaction"].should.have.been.called;
		});

		it("should hide the loading indicator", (): void => {
			scheduleEditController.payeeSelected();
			scheduleEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("securitySelected", (): void => {
		let	security: Security,
				primaryAccount: Account;

		beforeEach((): void => {
			scheduleEditController.transaction.id = null;
			security = createSecurity();
			primaryAccount = createAccount();
			scheduleEditController.mode = "Add Schedule";
			(scheduleEditController.transaction as ScheduledSecurityHoldingTransaction).security = security;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(scheduleEditController, "getSubtransactions" as keyof ScheduleEditController);
			sinon.stub(scheduleEditController, "useLastTransaction" as keyof ScheduleEditController);
		});

		it("should do nothing when editing an existing transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			(scheduleEditController.transaction as ScheduledSecurityHoldingTransaction).security = security;
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when the selected security is not an existing security", (): void => {
			((scheduleEditController.transaction as ScheduledSecurityHoldingTransaction).security as NewOrExistingEntity) = "security";
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", (): void => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			((scheduleEditController.transaction as ScheduledSecurityHoldingTransaction).security as Security).id = -1;
			scheduleEditController.securitySelected();
			scheduleEditController.loadingLastTransaction.should.be.true;
		});

		it("should fetch the last transaction for the selected security", (): void => {
			scheduleEditController.securitySelected();
			securityModel.findLastTransaction.should.have.been.calledWith(security.id, primaryAccount.account_type);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			scheduleEditController.securitySelected();
			scheduleEditController["getSubtransactions"].should.have.been.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			scheduleEditController.securitySelected();
			scheduleEditController["useLastTransaction"].should.have.been.called;
		});

		it("should hide the loading indicator", (): void => {
			scheduleEditController.securitySelected();
			scheduleEditController.loadingLastTransaction.should.be.false;
		});
	});

	describe("getSubtransactions", (): void => {
		describe("when a transaction is not provided", (): void => {
			it("should return undefined", (): Chai.Assertion => (undefined === scheduleEditController["getSubtransactions"]()).should.be.true);
		});

		describe("when a transaction is provided", (): void => {
			let transaction: ScheduledSplitTransaction;

			beforeEach((): ScheduledSplitTransaction => (transaction = createScheduledSplitTransaction()));

			it("should return the transaction if it is not a split, loan repayment or payslip", (): void => {
				const basicTransaction: ScheduledBasicTransaction = createScheduledBasicTransaction();

				(scheduleEditController["getSubtransactions"](basicTransaction) as ScheduledBasicTransaction).should.deep.equal(basicTransaction);
			});

			const scenarios: SplitTransactionType[] = ["Split", "LoanRepayment", "Payslip"];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it(`should fetch the subtransactions for a ${scenario} transaction`, (): void => {
					transaction.transaction_type = scenario;
					scheduleEditController["getSubtransactions"](transaction);
					transaction.subtransactions.should.be.an("array");
					transactionModel.findSubtransactions.should.have.been.calledWith(transaction.id);
				});
			});

			it("should eventually return a list of subtransactions stripped of their ids", async (): Promise<void> => {
				const expected: ScheduledSplitTransaction = angular.copy(transaction);

				expected.subtransactions = [
					createSubtransferTransaction({ id: null }),
					createSubtransaction({ id: null }),
					createSubtransaction({ id: null })
				] as SplitTransactionChild[];

				(await scheduleEditController["getSubtransactions"](transaction) as ScheduledSplitTransaction).should.deep.equal(expected);
			});
		});
	});

	describe("useLastTransaction", (): void => {
		let	transaction: ScheduledTransferTransaction,
				currentElement: Element | null,
				mockAngularElement: {triggerHandler: SinonStub;},
				realAngularElement: JQueryStatic;

		beforeEach((): void => {
			// The previous transaction to merge
			transaction = createScheduledTransferTransaction({ flag: "flag" });

			// The current transaction to merge into
			scheduleEditController.transaction = createScheduledTransferTransaction({
				payee: createPayee(),
				category: {
					id: "TransferFrom",
					name: "Transfer From"
				}
			});

			mockAngularElement = {
				triggerHandler: sinon.stub()
			};

			currentElement = null;
			realAngularElement = angular.element;
			(sinon.stub(angular, "element") as SinonStub).callsFake((selector: string): (Element | null)[] | {triggerHandler: SinonStub;} => {
				if ("#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo" === selector) {
					return [currentElement];
				}

				return mockAngularElement;
			});
		});

		it("should do nothing when a transaction is not provided", (): void => {
			scheduleEditController["useLastTransaction"]();
			(undefined === transaction.id as number | undefined).should.be.false;
		});

		it("should strip the transaction of it's id, transaction date, next due date, frequency, primary account, status & related status", (): void => {
			scheduleEditController["useLastTransaction"](transaction);
			(undefined === transaction.id as number | undefined).should.be.true;
			(undefined === transaction.transaction_date as Date | undefined).should.be.true;
			(undefined === transaction.next_due_date as Date | undefined).should.be.true;
			(undefined === transaction.frequency as ScheduleFrequency | undefined).should.be.true;
			(undefined === transaction.primary_account as Account | undefined).should.be.true;
			(undefined === transaction.status as TransactionStatus | undefined).should.be.true;
			(undefined === transaction.related_status as TransactionStatus | undefined).should.be.true;
		});

		it("should preserve the schedule's flag", (): void => {
			const flag = "schedule flag";

			scheduleEditController.transaction.flag = flag;
			scheduleEditController["useLastTransaction"](transaction);
			scheduleEditController.transaction.flag.should.equal(flag);
		});

		it("should ignore the previous transaction's flag", (): void => {
			scheduleEditController.transaction.flag = null;
			scheduleEditController["useLastTransaction"](transaction);
			(null === scheduleEditController.transaction.flag as TransactionFlag).should.be.true;
		});

		it("should merge the transaction details into vm.transaction", (): void => {
			scheduleEditController["useLastTransaction"](transaction);

			transaction.id = scheduleEditController.transaction.id;
			transaction.transaction_date = scheduleEditController.transaction.transaction_date;
			transaction.next_due_date = scheduleEditController.transaction.next_due_date;
			transaction.frequency = scheduleEditController.transaction.frequency;
			transaction.primary_account = scheduleEditController.transaction.primary_account;
			transaction.status = scheduleEditController.transaction.status;
			transaction.related_status = (scheduleEditController.transaction as ScheduledTransferTransaction).related_status;
			transaction.payee = (scheduleEditController.transaction as ScheduledTransferTransaction).payee;
			transaction.category = scheduleEditController.transaction.category as PsuedoCategory;

			scheduleEditController.transaction.should.deep.equal(transaction);
		});

		it("should retrigger the amount focus handler if focussed", (): void => {
			currentElement = document.activeElement;
			scheduleEditController["useLastTransaction"](transaction);
			$timeout.flush();
			mockAngularElement.triggerHandler.should.have.been.calledWith("focus");
		});

		it("should not retrigger the amount focus handler if not focussed", (): void => {
			scheduleEditController["useLastTransaction"](transaction);
			mockAngularElement.triggerHandler.should.not.have.been.called;
		});

		afterEach((): void => {
			$timeout.verifyNoPendingTasks();
			angular.element = realAngularElement;
		});
	});

	describe("categorySelected", (): void => {
		describe("(main transaction)", (): void => {
			beforeEach((): Category => (scheduleEditController.transaction.category = createCategory()));

			const scenarios: {id: string; type: TransactionType; direction: TransactionDirection | "the category direction"; subtransactions?: boolean;}[] = [
				{ id: "TransferTo", type: "Transfer", direction: "outflow" },
				{ id: "TransferFrom", type: "Transfer", direction: "inflow" },
				{ id: "SplitTo", type: "Split", direction: "outflow", subtransactions: true },
				{ id: "SplitFrom", type: "Split", direction: "inflow", subtransactions: true },
				{ id: "Payslip", type: "Payslip", direction: "inflow", subtransactions: true },
				{ id: "LoanRepayment", type: "LoanRepayment", direction: "outflow", subtransactions: true },
				{ id: "anything else", type: "Basic", direction: "the category direction" }
			];

			scenarios.forEach((scenario: {id: string; type: TransactionType; direction: TransactionDirection | "the category direction"; subtransactions?: boolean;}): void => {
				let	subtransactions: SplitTransactionChild[];
				const	memo = "test memo",
							amount = 123;

				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
					(scheduleEditController.transaction.category as PsuedoCategory).id = scenario.id;
					scheduleEditController.categorySelected();
					scheduleEditController.transaction.transaction_type.should.equal(scenario.type);

					if ("Basic" === scenario.type) {
						scheduleEditController.transaction.direction.should.equal((scheduleEditController.transaction.category as Category).direction);
					} else {
						scheduleEditController.transaction.direction.should.equal(scenario.direction);
					}
				});

				if (undefined !== scenario.subtransactions) {
					it(`should not create any stub subtransactions for a ${scenario.id} if some already exist`, (): void => {
						subtransactions = [
							createSubtransferTransaction(),
							createSubtransaction()
						];
						(scheduleEditController.transaction.category as PsuedoCategory).id = scenario.id;
						(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = subtransactions;
						scheduleEditController.categorySelected();
						(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions.should.equal(subtransactions);
					});

					it(`should create four stub subtransactions for a ${scenario.id} if none exist`, (): void => {
						subtransactions = [{ memo, amount }, {}, {}, {}];
						(scheduleEditController.transaction.category as PsuedoCategory).id = scenario.id;
						delete (scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions;
						scheduleEditController.transaction.memo = memo;
						(scheduleEditController.transaction as ScheduledSplitTransaction).amount = amount;
						scheduleEditController.categorySelected();
						(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions.should.deep.equal(subtransactions);
					});
				}
			});

			it("should set the transaction type to Basic if the selected category is not an existing category", (): void => {
				(scheduleEditController.transaction as ScheduledBasicTransaction).category = "new category";
				scheduleEditController.categorySelected();
				scheduleEditController.transaction.transaction_type.should.equal("Basic");
			});
		});

		describe("(subtransaction)", (): void => {
			beforeEach((): SplitTransactionChild[] => ((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [createSubtransaction()]));

			const scenarios: {id: string; type: SubtransactionType; direction: TransactionDirection | "the category direction";}[] = [
				{ id: "TransferTo", type: "Subtransfer", direction: "outflow" },
				{ id: "TransferFrom", type: "Subtransfer", direction: "inflow" },
				{ id: "anything else", type: "Sub", direction: "the category direction" }
			];

			scenarios.forEach((scenario: {id: string; type: SubtransactionType; direction: TransactionDirection | "the category direction";}): void => {
				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
					((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].category as PsuedoCategory).id = scenario.id;
					scheduleEditController.categorySelected(0);
					((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].transaction_type as SubtransactionType).should.equal(scenario.type);

					if ("Sub" === scenario.type) {
						((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].direction as TransactionDirection).should.equal(((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].category as Category).direction);
					} else {
						((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].direction as TransactionDirection).should.equal(scenario.direction);
					}
				});
			});

			it("should set the transaction type to Sub if the selected category is not an existing category", (): void => {
				(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].category = "new category";
				scheduleEditController.categorySelected(0);
				((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].transaction_type as SubtransactionType).should.equal("Sub");
			});
		});

		it("should set the direction to outflow if the selected category is not an existing category", (): void => {
			scheduleEditController.categorySelected();
			scheduleEditController.transaction.direction.should.equal("outflow");
		});

		it("should clear the subcategory if it's parent no longer matches the selected category", (): void => {
			(scheduleEditController.transaction as ScheduledBasicTransaction).subcategory = createCategory({ parent_id: 2 });
			scheduleEditController.categorySelected();
			(null === (scheduleEditController.transaction as ScheduledBasicTransaction).subcategory).should.be.true;
		});
	});

	describe("investmentCategorySelected", (): void => {
		beforeEach((): PsuedoCategory => (scheduleEditController.transaction.category = { id: "", name: "" }));

		it("should do nothing if the selected category is not an existing category", (): void => {
			const transactionType: SecurityTransactionType = "SecurityTransfer",
						direction: TransactionDirection = "inflow";

			scheduleEditController.transaction.category = "new category";
			scheduleEditController.transaction.transaction_type = transactionType;
			scheduleEditController.transaction.direction = direction;
			scheduleEditController.investmentCategorySelected();
			scheduleEditController.transaction.transaction_type.should.equal(transactionType);
			scheduleEditController.transaction.direction.should.equal(direction);
		});

		const scenarios: {id: string; type: SecurityTransactionType; direction: TransactionDirection;}[] = [
			{ id: "TransferTo", type: "SecurityTransfer", direction: "outflow" },
			{ id: "TransferFrom", type: "SecurityTransfer", direction: "inflow" },
			{ id: "RemoveShares", type: "SecurityHolding", direction: "outflow" },
			{ id: "AddShares", type: "SecurityHolding", direction: "inflow" },
			{ id: "Sell", type: "SecurityInvestment", direction: "outflow" },
			{ id: "Buy", type: "SecurityInvestment", direction: "inflow" },
			{ id: "DividendTo", type: "Dividend", direction: "outflow" }
		];

		scenarios.forEach((scenario: {id: string; type: SecurityTransactionType; direction: TransactionDirection;}): void => {
			it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
				(scheduleEditController.transaction.category as PsuedoCategory).id = scenario.id;
				scheduleEditController.investmentCategorySelected();
				scheduleEditController.transaction.transaction_type.should.equal(scenario.type);
				scheduleEditController.transaction.direction.should.equal(scenario.direction);
			});
		});
	});

	describe("primaryAccountSelected", (): void => {
		beforeEach((): Account => (scheduleEditController.transaction.primary_account = createAccount({ id: 1 })));

		it("should clear the category and subcategory if the account type no longer matches the primary account type", (): void => {
			scheduleEditController["account_type"] = "cash";
			scheduleEditController.primaryAccountSelected();
			(null === (scheduleEditController.transaction as CategorisableTransaction).category).should.be.true;
			(null === (scheduleEditController.transaction as SubcategorisableTransaction).subcategory).should.be.true;
		});

		it("should set the account type to the primary account type", (): void => {
			scheduleEditController.primaryAccountSelected();
			(scheduleEditController["account_type"] as AccountType).should.equal("bank");
		});

		it("should set the account type to null when there is no primary account", (): void => {
			delete scheduleEditController.transaction.primary_account;
			scheduleEditController.primaryAccountSelected();
			(null === scheduleEditController["account_type"]).should.be.true;
		});

		it("should do nothing when the transfer account is null", (): void => {
			(scheduleEditController.transaction as ScheduledTransferTransaction).account = null;
			scheduleEditController.primaryAccountSelected();
			(null === (scheduleEditController.transaction as ScheduledTransferTransaction).account).should.be.true;
		});

		it("should do nothing when the transfer account is undefined", (): void => {
			delete (scheduleEditController.transaction as ScheduledTransferTransaction).account;
			scheduleEditController.primaryAccountSelected();
			scheduleEditController.transaction.should.not.have.property("account");
		});

		it("should clear the transfer account when the primary account matches", (): void => {
			(scheduleEditController.transaction as ScheduledTransferTransaction).account = createAccount({ id: 1 });
			scheduleEditController.primaryAccountSelected();
			(null === (scheduleEditController.transaction as ScheduledTransferTransaction).account).should.be.true;
		});
	});

	describe("$watch subtransations", (): void => {
		let subtransactions: Partial<Subtransaction>[];

		beforeEach((): void => {
			subtransactions = [
				createSubtransaction({ amount: 10, direction: "outflow" }),
				createSubtransaction({ amount: 5, direction: "inflow" }),
				{}
			];
			sinon.stub(scheduleEditController, "memoFromSubtransactions");

			scheduleEditController.transaction.direction = "outflow";
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [{}, {}];
			(scheduleEditController as angular.IController).$scope.$digest();
		});

		it("should do nothing if the watched value hasn't changed", (): void => {
			(scheduleEditController as angular.IController).$scope.$digest();
			(null === scheduleEditController.totalAllocated).should.be.true;
		});

		it("should do nothing if there are no subtransactions", (): void => {
			delete (scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			(null === scheduleEditController.totalAllocated).should.be.true;
		});

		it("should calculate the total and make it available to the view", (): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			(scheduleEditController.totalAllocated as number).should.equal(5);
		});

		it("should not set the main transaction memo when editing an existing transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			scheduleEditController.memoFromSubtransactions.should.not.have.been.called;
		});

		it("should set the main transaction memo when adding a new transaction", (): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			scheduleEditController.memoFromSubtransactions.should.have.been.called;
		});
	});

	describe("memoFromSubtransactions", (): void => {
		beforeEach((): void => {
			const memo = "memo";

			scheduleEditController.transaction.memo = memo;
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [
				createSubtransaction({ memo: "memo 1" }),
				createSubtransaction({ memo: "memo 2" }),
				{}
			];
		});

		it("should join the sub transaction memos and set the main transaction memo when adding a new transaction", (): void => {
			scheduleEditController.memoFromSubtransactions();
			scheduleEditController.transaction.memo.should.equal("memo 1; memo 2");
		});
	});

	describe("primaryAccounts", (): void => {
		let accounts: angular.IPromise<Account[]>;

		beforeEach((): angular.IPromise<Account[]> => (accounts = scheduleEditController.primaryAccounts("a", 3)));

		it("should fetch the list of accounts", (): Chai.Assertion => accountModel.all.should.have.been.called);

		it("should return a filtered & limited list of accounts", async (): Promise<Chai.Assertion> => (await accounts).should.deep.equal([
			createAccount({ id: 1, name: "aa", closing_balance: 100, opening_balance: 100 }),
			createAccount({ id: 4, name: "ba", account_type: "asset" }),
			createAccount({ id: 5, name: "ab", account_type: "asset" })
		]));
	});

	describe("accounts", (): void => {
		it("should fetch the list of accounts", (): void => {
			scheduleEditController.accounts("a", 2);
			accountModel.all.should.have.been.called;
		});

		it("should remove the current account from the list", async (): Promise<void> => {
			scheduleEditController.transaction.primary_account = createAccount({ name: "aa" });
			(await scheduleEditController.accounts("a", 2)).should.deep.equal([
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" })
			]);
		});

		it("should not filter the list if there is no current account", async (): Promise<void> => {
			delete scheduleEditController.transaction.primary_account;
			(await scheduleEditController.accounts("a", 2)).should.deep.equal([
				createAccount({ id: 1, name: "aa", closing_balance: 100, opening_balance: 100 }),
				createAccount({ id: 4, name: "ba", account_type: "asset" })
			]);
		});

		it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", async (): Promise<Chai.Assertion> => (await scheduleEditController.accounts("b", 2)).should.deep.equal([
			createAccount({ id: 4, name: "ba", account_type: "asset" }),
			createAccount({ id: 5, name: "ab", account_type: "asset" })
		]));

		it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", async (): Promise<void> => {
			scheduleEditController.transaction.transaction_type = "SecurityTransfer";
			(await scheduleEditController.accounts("b", 2)).should.deep.equal([
				createAccount({ id: 2, name: "bb", account_type: "investment" }),
				createAccount({ id: 6, name: "bc", account_type: "investment" })
			]);
		});
	});

	describe("frequencies", (): void => {
		it("should return the full list of frequencies when a filter is not specified", (): Chai.Assertion => scheduleEditController.frequencies().should.deep.equal(["Weekly", "Fortnightly", "Monthly", "Bimonthly", "Quarterly", "Yearly"]));

		it("should return a filtered list of frequencies when a filter is specified", (): Chai.Assertion => scheduleEditController.frequencies("t").should.deep.equal(["Fortnightly", "Monthly", "Bimonthly", "Quarterly"]));
	});

	describe("addSubtransaction", (): void => {
		it("should add an empty object to the subtransactions array", (): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [];
			scheduleEditController.addSubtransaction();
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions.should.deep.equal([{}]);
		});
	});

	describe("deleteSubtransaction", (): void => {
		it("should remove an item from the subtransactions array at the specified index", (): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 2 }),
				createSubtransaction({ id: 3 })
			];
			scheduleEditController.deleteSubtransaction(1);
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions.should.deep.equal([
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 3 })
			]);
		});
	});

	describe("addUnallocatedAmount", (): void => {
		beforeEach((): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).amount = 100;
			scheduleEditController.totalAllocated = 80;
			(scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions = [
				createSubtransaction({ amount: 80 }),
				createSubtransaction({ amount: undefined })
			];
		});

		it("should increase an existing subtransaction amount by the unallocated amount", (): void => {
			scheduleEditController.addUnallocatedAmount(0);
			((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[0].amount as number).should.equal(100);
		});

		it("should set a blank subtransaction amount to the unallocated amount", (): void => {
			scheduleEditController.addUnallocatedAmount(1);
			((scheduleEditController.transaction as ScheduledSplitTransaction).subtransactions[1].amount as number).should.equal(20);
		});
	});

	describe("calculateNextDue", (): void => {
		const scenarios: {frequency: ScheduleFrequency; period: string; amount: number; addFn: (date: Date, amount: number) => Date;}[] = [
			{ frequency: "Weekly", period: "weeks", amount: 1, addFn: addWeeks },
			{ frequency: "Fortnightly", period: "weeks", amount: 2, addFn: addWeeks },
			{ frequency: "Monthly", period: "month", amount: 1, addFn: addMonths },
			{ frequency: "Bimonthly", period: "month", amount: 2, addFn: addMonths },
			{ frequency: "Quarterly", period: "quarters", amount: 1, addFn: addQuarters },
			{ frequency: "Yearly", period: "year", amount: 1, addFn: addYears }
		];

		scenarios.forEach((scenario: {frequency: ScheduleFrequency; period: string; amount: number; addFn: (date: Date, amount: number) => Date;}): void => {
			it(`should add ${scenario.amount} ${scenario.period} to the next due date when the frequency is ${scenario.frequency}`, (): void => {
				const nextDueDate: Date = scheduleEditController.schedule.next_due_date as Date;

				scheduleEditController.schedule.frequency = scenario.frequency;
				scheduleEditController["calculateNextDue"]();
				scheduleEditController.schedule.next_due_date.should.deep.equal(scenario.addFn(nextDueDate, scenario.amount));
			});
		});

		it("should decrement the overdue count when greater than zero", (): void => {
			scheduleEditController.schedule.overdue_count = 1;
			scheduleEditController.schedule.frequency = "Weekly";
			scheduleEditController["calculateNextDue"]();
			scheduleEditController.schedule.overdue_count.should.equal(0);
		});

		it("should leave the overdue account unchanged when zero", (): void => {
			scheduleEditController.schedule.overdue_count = 0;
			scheduleEditController.schedule.frequency = "Weekly";
			scheduleEditController["calculateNextDue"]();
			scheduleEditController.schedule.overdue_count.should.equal(0);
		});
	});

	describe("updateInvestmentDetails", (): void => {
		let	amount: number,
				memo: string;

		beforeEach((): void => {
			amount = 100;
			memo = "memo";
			scheduleEditController.transaction.id = null;
			scheduleEditController.transaction.transaction_type = "SecurityInvestment";
			(scheduleEditController.transaction as ScheduledSecurityHoldingTransaction).quantity = 2;
			(scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).price = 10;
			(scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).commission = 1;
			(scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).amount = amount;
			scheduleEditController.transaction.memo = memo;
		});

		it("should do nothing when the transaction type is not SecurityInvestment", (): void => {
			scheduleEditController.transaction.transaction_type = "Basic";
			scheduleEditController.updateInvestmentDetails();
			(scheduleEditController.transaction as ScheduledBasicTransaction).amount.should.equal(amount);
			scheduleEditController.transaction.memo.should.equal(memo);
		});

		it("should not update the memo when editing an existing Security Investment transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.updateInvestmentDetails();
			scheduleEditController.transaction.memo.should.equal(memo);
		});

		const scenarios: {direction: TransactionDirection; amount: number; memo: string;}[] = [
			{ direction: "outflow", amount: 19, memo: "less" },
			{ direction: "inflow", amount: 21, memo: "plus" }
		];

		scenarios.forEach((scenario: {direction: TransactionDirection; amount: number; memo: string;}): void => {
			it(`should set the transaction amount to zero and the memo to an empty string if the price, quantity and commission are not specified for a Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
				scheduleEditController.transaction.direction = scenario.direction;
				delete (scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).quantity;
				delete (scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).price;
				delete (scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).commission;
				scheduleEditController.updateInvestmentDetails();
				(scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).amount.should.equal(0);
				scheduleEditController.transaction.memo.should.be.empty;
			});

			it(`should calculate the transaction amount from the price, quantity and commission for a Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
				scheduleEditController.transaction.direction = scenario.direction;
				scheduleEditController.updateInvestmentDetails();
				(scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction).amount.should.equal(scenario.amount);
			});

			it(`should update the memo with the price, quantity and commission when adding a new Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
				scheduleEditController.transaction.direction = scenario.direction;
				scheduleEditController.updateInvestmentDetails();
				scheduleEditController.transaction.memo.should.equal(`2 @ $10.00 (${scenario.memo} $1.00 commission)`);
			});
		});
	});

	describe("edit", (): void => {
		beforeEach((): void => scheduleEditController.edit());

		it("should set the mode to Edit Schedule", (): Chai.Assertion => scheduleEditController.mode.should.equal("Edit Schedule"));

		it("should set the transaction to the schedule", (): Chai.Assertion => scheduleEditController.transaction.should.equal(scheduleEditController.schedule));
	});

	describe("enter", (): void => {
		beforeEach((): void => {
			sinon.stub(scheduleEditController, "skip");
			scheduleEditController.transaction.id = 1;
		});

		it("should reset any previous error messages", (): void => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.enter();
			(null === scheduleEditController.errorMessage as string | null).should.be.true;
		});

		it("should save the schedule", (): void => {
			scheduleEditController.enter();
			transactionModel.save.should.have.been.calledWith(scheduleEditController.transaction);
		});

		it("should update the next due date when the transaction save is successful", (): void => {
			scheduleEditController.enter();
			scheduleEditController.skip.should.have.been.called;
		});

		it("should display an error message when the transaction save is unsuccessful", (): void => {
			scheduleEditController.transaction.id = -1;
			scheduleEditController.enter();
			(scheduleEditController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("skip", (): void => {
		beforeEach((): void => {
			sinon.stub(scheduleEditController, "calculateNextDue" as keyof ScheduleEditController);
			sinon.stub(scheduleEditController, "save");
			scheduleEditController.skip();
		});

		it("should calculate the next due date", (): Chai.Assertion => scheduleEditController["calculateNextDue"].should.have.been.called);

		it("should save the schedule", (): Chai.Assertion => scheduleEditController.save.should.have.been.calledWith(true));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.save();
			(null === scheduleEditController.errorMessage as string | null).should.be.true;
		});

		it("should set the flag memo to '(no memo)' if the auto-flag property is set and the memo is blank", (): void => {
			scheduleEditController.schedule.autoFlag = true;
			scheduleEditController.save();
			(scheduleEditController.schedule.flag as string).should.equal("(no memo)");
		});

		it("should preserve the flag memo if the auto-flag property is set", (): void => {
			scheduleEditController.schedule.autoFlag = true;
			scheduleEditController.schedule.flag = "Test flag";
			scheduleEditController.save();
			scheduleEditController.schedule.flag.should.equal("Test flag");
		});

		it("should set the flag to null if the auto-flag property is not set", (): void => {
			scheduleEditController.schedule.flag = "Test flag";
			scheduleEditController.save();
			(null === scheduleEditController.schedule.flag as string | null).should.be.true;
		});

		it("should save the schedule", (): void => {
			scheduleEditController.save();
			scheduleModel.save.should.have.been.calledWith(schedule);
		});

		it("should close the modal when the schedule save is successful", (): void => {
			scheduleEditController.save();
			$uibModalInstance.close.should.have.been.calledWith({ data: schedule, skipped: false });
		});

		it("should mark the schedule as skipped when the skipped parameter is true", (): void => {
			scheduleEditController.save(true);
			$uibModalInstance.close.should.have.been.calledWith({ data: schedule, skipped: true });
		});

		it("should display an error message when the schedule save is unsuccessful", (): void => {
			scheduleEditController.schedule.id = -1;
			scheduleEditController.save();
			(scheduleEditController.errorMessage as string).should.equal("unsuccessful");
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			scheduleEditController.cancel();
			$uibModalInstance.dismiss.should.have.been.called;
		});
	});
});
