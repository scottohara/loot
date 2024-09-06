import type { Account, AccountType } from "~/accounts/types";
import type {
	CategorisableTransaction,
	SecurityTransactionType,
	SplitTransactionChild,
	SplitTransactionType,
	SubcategorisableTransaction,
	Subtransaction,
	SubtransactionType,
	TransactionDirection,
	TransactionFlag,
	TransactionFlagType,
	TransactionStatus,
	TransactionType,
} from "~/transactions/types";
import type {
	Category,
	DisplayCategory,
	PsuedoCategory,
} from "~/categories/types";
import type {
	ScheduleFrequency,
	ScheduledBasicTransaction,
	ScheduledSecurityHoldingTransaction,
	ScheduledSecurityInvestmentTransaction,
	ScheduledSplitTransaction,
	ScheduledTransaction,
	ScheduledTransferTransaction,
} from "~/schedules/types";
import {
	addMonths,
	addQuarters,
	addWeeks,
	addYears,
	startOfDay,
} from "date-fns";
import {
	createScheduledBasicTransaction,
	createScheduledSplitTransaction,
	createScheduledTransferTransaction,
} from "~/mocks/schedules/factories";
import {
	createSubtransaction,
	createSubtransferTransaction,
} from "~/mocks/transactions/factories";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { NewOrExistingEntity } from "~/loot/types";
import type { Payee } from "~/payees/types";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type ScheduleEditController from "~/schedules/controllers/edit";
import type { ScheduleModelMock } from "~/mocks/schedules/types";
import type { Security } from "~/securities/types";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type { SinonStub } from "sinon";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import createCategory from "~/mocks/categories/factories";
import createPayee from "~/mocks/payees/factories";
import createSecurity from "~/mocks/securities/factories";
import sinon from "sinon";

describe("ScheduleEditController", (): void => {
	let scheduleEditController: ScheduleEditController,
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
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootSchedules",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"payeeModel",
					"securityModel",
					"categoryModel",
					"accountModel",
					"transactionModel",
					"scheduleModel",
					"schedule",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$uibModalInstance_: UibModalInstanceMock,
				_$timeout_: angular.ITimeoutService,
				_payeeModel_: PayeeModelMock,
				_securityModel_: SecurityModelMock,
				_categoryModel_: CategoryModelMock,
				_accountModel_: AccountModelMock,
				_transactionModel_: TransactionModelMock,
				_scheduleModel_: ScheduleModelMock,
				_schedule_: ScheduledTransaction,
			): void => {
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
				scheduleEditController = controllerTest(
					"ScheduleEditController",
				) as ScheduleEditController;
			},
		) as Mocha.HookFunction,
	);

	describe("when a schedule is provided", (): void => {
		let originalSchedule: ScheduledTransaction;

		beforeEach((): void => {
			originalSchedule = angular.copy(schedule);
			originalSchedule.flag_type = "followup";
			schedule.id = null;
			schedule.transaction_date = schedule.next_due_date;
		});

		it("should make the passed schedule available to the view", (): Chai.Assertion =>
			expect(scheduleEditController.transaction).to.deep.equal(schedule));

		it("should set the mode to Enter Transaction", (): Chai.Assertion =>
			expect(scheduleEditController.mode).to.equal("Enter Transaction"));

		it("should make a copy of the transaction as schedule available to the view", (): void => {
			expect(scheduleEditController.schedule.id as number).to.not.be.null;
			expect(scheduleEditController.schedule).to.deep.equal(originalSchedule);
		});

		it("should clear the transaction id", (): Chai.Assertion =>
			expect(scheduleEditController.transaction.id).to.be.null);

		it("should set the transaction date to the next due date", (): Chai.Assertion =>
			expect(
				scheduleEditController.transaction.transaction_date as Date,
			).to.deep.equal(schedule.next_due_date));
	});

	describe("when a schedule is not provided", (): void => {
		let transaction: Partial<ScheduledBasicTransaction>;

		beforeEach((): void => {
			transaction = {
				id: null,
				transaction_type: "Basic",
				next_due_date: startOfDay(new Date()),
				autoFlag: false,
				flag_type: "followup",
			};
			scheduleEditController = controllerTest("ScheduleEditController", {
				schedule: undefined,
			}) as ScheduleEditController;
		});

		it("should make an empty transaction object available to the view", (): Chai.Assertion =>
			expect(scheduleEditController.transaction).to.deep.equal(transaction));

		it("should set the mode to Add Schedule", (): Chai.Assertion =>
			expect(scheduleEditController.mode).to.equal("Add Schedule"));

		it("should make an alias of the transaction as schedule available to the view", (): Chai.Assertion =>
			expect(scheduleEditController.schedule).to.equal(
				scheduleEditController.transaction,
			));
	});

	it("should set the auto-flag property when a flag type is present", (): void => {
		schedule.flag_type = "noreceipt";
		scheduleEditController = controllerTest(
			"ScheduleEditController",
		) as ScheduleEditController;
		expect(scheduleEditController.schedule.autoFlag).to.be.true;
	});

	it("should not set the auto-flag property when a flag type is absent", (): Chai.Assertion =>
		expect(scheduleEditController.schedule.autoFlag).to.be.false);

	it("should set a default flag type when a flag type is absent", (): Chai.Assertion =>
		expect(String(scheduleEditController.schedule.flag_type)).to.equal(
			"followup",
		));

	it("should set the flag memo to null when the flag memo is '(no memo)'", (): void => {
		schedule.flag = "(no memo)";
		scheduleEditController = controllerTest(
			"ScheduleEditController",
		) as ScheduleEditController;
		expect(scheduleEditController.schedule.flag).to.be.null;
	});

	it("should prefetch the payees list to populate the cache", (): Chai.Assertion =>
		expect(payeeModel.all).to.have.been.called);

	describe("payees", (): void => {
		let payees: angular.IPromise<Payee[]>;

		beforeEach(
			(): angular.IPromise<Payee[]> =>
				(payees = scheduleEditController.payees("a", 3)),
		);

		it("should fetch the list of payees", (): Chai.Assertion =>
			expect(payeeModel.all).to.have.been.called);

		it("should return a filtered & limited list of payees", async (): Promise<Chai.Assertion> =>
			expect(await payees).to.deep.equal([
				createPayee({ id: 1, name: "aa" }),
				createPayee({ id: 4, name: "ba" }),
				createPayee({ id: 5, name: "ab" }),
			]));
	});

	describe("securities", (): void => {
		let securities: angular.IPromise<Security[]>;

		beforeEach(
			(): angular.IPromise<Security[]> =>
				(securities = scheduleEditController.securities("a", 3)),
		);

		it("should fetch the list of securities", (): Chai.Assertion =>
			expect(securityModel.all).to.have.been.called);

		it("should return a filtered & limited list of securities", async (): Promise<Chai.Assertion> =>
			expect(await securities).to.deep.equal([
				createSecurity({
					id: 1,
					name: "aa",
					closing_balance: 1.006,
					code: "A",
					current_holding: 1,
				}),
				createSecurity({
					id: 4,
					name: "ba",
					closing_balance: 4,
					code: "D",
					current_holding: 1,
				}),
				createSecurity({
					id: 5,
					name: "ab",
					closing_balance: 5,
					code: "E",
					current_holding: 1,
				}),
			]));
	});

	describe("categories", (): void => {
		let categories: angular.IPromise<DisplayCategory[]> | DisplayCategory[],
			parentCategory: Category;

		beforeEach((): Category => (parentCategory = createCategory({ id: 1 })));

		it("should return an empty array if the parent category is new", (): void => {
			delete parentCategory.id;
			categories = scheduleEditController.categories("a", 3, parentCategory);
			expect(categories).to.be.an("array");
			expect(categories).to.be.empty;
		});

		describe("(parent categories)", (): void => {
			it("should fetch the list of parent categories", (): void => {
				categories = scheduleEditController.categories("a", 3);
				expect(categoryModel.all).to.have.been.calledWith(undefined);
			});

			it("should include transfer categories", async (): Promise<Chai.Assertion> =>
				expect(await scheduleEditController.categories("a", 5)).to.deep.equal([
					{ id: "TransferTo", name: "Transfer To" },
					{ id: "TransferFrom", name: "Transfer From" },
					createCategory({
						id: 1,
						name: "aa",
						num_children: 2,
						children: [
							createCategory({
								id: 10,
								name: "aa_1",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
							createCategory({
								id: 11,
								name: "aa_2",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
						],
					}),
					createCategory({
						id: 4,
						name: "ba",
						direction: "outflow",
						children: [],
					}),
					createCategory({ id: 5, name: "ab", children: [] }),
				]));

			it("should include split categories if requested", async (): Promise<Chai.Assertion> =>
				expect(
					await scheduleEditController.categories("a", 7, null, true),
				).to.deep.equal([
					{ id: "TransferTo", name: "Transfer To" },
					{ id: "TransferFrom", name: "Transfer From" },
					{ id: "Payslip", name: "Payslip" },
					{ id: "LoanRepayment", name: "Loan Repayment" },
					createCategory({
						id: 1,
						name: "aa",
						num_children: 2,
						children: [
							createCategory({
								id: 10,
								name: "aa_1",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
							createCategory({
								id: 11,
								name: "aa_2",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
						],
					}),
					createCategory({
						id: 4,
						name: "ba",
						direction: "outflow",
						children: [],
					}),
					createCategory({ id: 5, name: "ab", children: [] }),
				]));
		});

		describe("(subcategories)", (): void => {
			it("should fetch the subcategories for the specified parent category", (): void => {
				categories = scheduleEditController.categories("a", 3, parentCategory);
				expect(categoryModel.all).to.have.been.calledWith(1);
			});

			it("should eventually return a filtered & limited list of subcategories", async (): Promise<Chai.Assertion> =>
				expect(
					await scheduleEditController.categories("a", 3, parentCategory),
				).to.deep.equal([
					createCategory({
						id: 1,
						name: "aa",
						num_children: 2,
						children: [
							createCategory({
								id: 10,
								name: "aa_1",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
							createCategory({
								id: 11,
								name: "aa_2",
								parent_id: 1,
								parent: createCategory({ id: 1, name: "aa", num_children: 2 }),
							}),
						],
					}),
					createCategory({
						id: 4,
						name: "ba",
						direction: "outflow",
						children: [],
					}),
					createCategory({ id: 5, name: "ab", children: [] }),
				]));
		});
	});

	describe("investmentCategories", (): void => {
		it("should return the full list of investment categories when a filter is not specified", (): Chai.Assertion =>
			expect(scheduleEditController.investmentCategories()).to.deep.equal([
				{ id: "Buy", name: "Buy" },
				{ id: "Sell", name: "Sell" },
				{ id: "DividendTo", name: "Dividend To" },
				{ id: "AddShares", name: "Add Shares" },
				{ id: "RemoveShares", name: "Remove Shares" },
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" },
			]));

		it("should return a filtered list of investment categories when a filter is specified", (): Chai.Assertion =>
			expect(scheduleEditController.investmentCategories("a")).to.deep.equal([
				{ id: "AddShares", name: "Add Shares" },
				{ id: "RemoveShares", name: "Remove Shares" },
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" },
			]));
	});

	describe("isString", (): void => {
		it("should return false if the object is not a string", (): Chai.Assertion =>
			expect(scheduleEditController.isString({})).to.be.false);

		it("should return false if the object is an empty string", (): Chai.Assertion =>
			expect(scheduleEditController.isString("")).to.be.false);

		it("should return true if the object is a string and is not empty", (): Chai.Assertion =>
			expect(scheduleEditController.isString("test")).to.be.true);
	});

	describe("payeeSelected", (): void => {
		let payee: Payee, primaryAccount: Account;

		beforeEach((): void => {
			scheduleEditController.transaction.id = null;
			payee = createPayee();
			primaryAccount = createAccount();
			scheduleEditController.mode = "Add Schedule";
			(scheduleEditController.transaction as ScheduledBasicTransaction).payee =
				payee;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(
				scheduleEditController,
				"getSubtransactions" as keyof ScheduleEditController,
			);
			sinon.stub(
				scheduleEditController,
				"useLastTransaction" as keyof ScheduleEditController,
			);
		});

		it("should do nothing when editing an existing schedule", (): void => {
			scheduleEditController.transaction.id = 1;
			(scheduleEditController.transaction as ScheduledBasicTransaction).payee =
				payee;
			scheduleEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when the selected payee is not an existing payee", (): void => {
			((scheduleEditController.transaction as ScheduledBasicTransaction)
				.payee as NewOrExistingEntity) = "payee";
			scheduleEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", (): void => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			(
				(scheduleEditController.transaction as ScheduledBasicTransaction)
					.payee as Payee
			).id = -1;
			scheduleEditController.payeeSelected();
			expect(scheduleEditController.loadingLastTransaction).to.be.true;
		});

		it("should fetch the last transaction for the selected payee", (): void => {
			scheduleEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.have.been.calledWith(
				payee.id,
				primaryAccount.account_type,
			);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			scheduleEditController.payeeSelected();
			expect(scheduleEditController["getSubtransactions"]).to.have.been.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			scheduleEditController.payeeSelected();
			expect(scheduleEditController["useLastTransaction"]).to.have.been.called;
		});

		it("should hide the loading indicator", (): void => {
			scheduleEditController.payeeSelected();
			expect(scheduleEditController.loadingLastTransaction).to.be.false;
		});
	});

	describe("securitySelected", (): void => {
		let security: Security, primaryAccount: Account;

		beforeEach((): void => {
			scheduleEditController.transaction.id = null;
			security = createSecurity();
			primaryAccount = createAccount();
			scheduleEditController.mode = "Add Schedule";
			(
				scheduleEditController.transaction as ScheduledSecurityHoldingTransaction
			).security = security;
			scheduleEditController.transaction.primary_account = primaryAccount;
			sinon.stub(
				scheduleEditController,
				"getSubtransactions" as keyof ScheduleEditController,
			);
			sinon.stub(
				scheduleEditController,
				"useLastTransaction" as keyof ScheduleEditController,
			);
		});

		it("should do nothing when editing an existing transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			(
				scheduleEditController.transaction as ScheduledSecurityHoldingTransaction
			).security = security;
			scheduleEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when the selected security is not an existing security", (): void => {
			((
				scheduleEditController.transaction as ScheduledSecurityHoldingTransaction
			).security as NewOrExistingEntity) = "security";
			scheduleEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when entering a transaction from a schedule", (): void => {
			scheduleEditController.mode = "Enter Transaction";
			scheduleEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			(
				(
					scheduleEditController.transaction as ScheduledSecurityHoldingTransaction
				).security as Security
			).id = -1;
			scheduleEditController.securitySelected();
			expect(scheduleEditController.loadingLastTransaction).to.be.true;
		});

		it("should fetch the last transaction for the selected security", (): void => {
			scheduleEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.have.been.calledWith(
				security.id,
				primaryAccount.account_type,
			);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			scheduleEditController.securitySelected();
			expect(scheduleEditController["getSubtransactions"]).to.have.been.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			scheduleEditController.securitySelected();
			expect(scheduleEditController["useLastTransaction"]).to.have.been.called;
		});

		it("should hide the loading indicator", (): void => {
			scheduleEditController.securitySelected();
			expect(scheduleEditController.loadingLastTransaction).to.be.false;
		});
	});

	describe("getSubtransactions", (): void => {
		describe("when a transaction is not provided", (): void => {
			it("should return undefined", (): Chai.Assertion =>
				expect(scheduleEditController["getSubtransactions"]()).to.be.undefined);
		});

		describe("when a transaction is provided", (): void => {
			let transaction: ScheduledSplitTransaction;

			beforeEach(
				(): ScheduledSplitTransaction =>
					(transaction = createScheduledSplitTransaction()),
			);

			it("should return the transaction if it is not a split, loan repayment or payslip", (): void => {
				const basicTransaction: ScheduledBasicTransaction =
					createScheduledBasicTransaction();

				expect(
					scheduleEditController["getSubtransactions"](
						basicTransaction,
					) as ScheduledBasicTransaction,
				).to.deep.equal(basicTransaction);
			});

			const scenarios: SplitTransactionType[] = [
				"Split",
				"LoanRepayment",
				"Payslip",
			];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it(`should fetch the subtransactions for a ${scenario} transaction`, (): void => {
					transaction.transaction_type = scenario;
					scheduleEditController["getSubtransactions"](transaction);
					expect(transaction.subtransactions).to.be.an("array");
					expect(transactionModel.findSubtransactions).to.have.been.calledWith(
						transaction.id,
					);
				});
			});

			it("should eventually return a list of subtransactions stripped of their ids", async (): Promise<void> => {
				const expected: ScheduledSplitTransaction = angular.copy(transaction);

				expected.subtransactions = [
					createSubtransferTransaction({ id: null }),
					createSubtransaction({ id: null }),
					createSubtransaction({ id: null }),
				] as SplitTransactionChild[];

				expect(
					(await scheduleEditController["getSubtransactions"](
						transaction,
					)) as ScheduledSplitTransaction,
				).to.deep.equal(expected);
			});
		});
	});

	describe("useLastTransaction", (): void => {
		let transaction: ScheduledTransferTransaction,
			currentElement: Element | null,
			mockAngularElement: { triggerHandler: SinonStub },
			realAngularElement: JQueryStatic;

		beforeEach((): void => {
			// The previous transaction to merge
			transaction = createScheduledTransferTransaction({ flag: "flag" });

			// The current transaction to merge into
			scheduleEditController.transaction = createScheduledTransferTransaction({
				payee: createPayee(),
				category: {
					id: "TransferFrom",
					name: "Transfer From",
				},
			});

			mockAngularElement = {
				triggerHandler: sinon.stub(),
			};

			currentElement = null;
			realAngularElement = angular.element;
			(sinon.stub(angular, "element") as SinonStub).callsFake(
				(
					selector: string,
				): (Element | null)[] | { triggerHandler: SinonStub } => {
					if (
						"#amount, #category, #subcategory, #account, #quantity, #price, #commission, #memo" ===
						selector
					) {
						return [currentElement];
					}

					return mockAngularElement;
				},
			);
		});

		it("should do nothing when a transaction is not provided", (): void => {
			scheduleEditController["useLastTransaction"]();
			expect(transaction.id as number | undefined).to.not.be.undefined;
		});

		it("should strip the transaction of it's id, transaction date, next due date, frequency, primary account, status & related status", (): void => {
			scheduleEditController["useLastTransaction"](transaction);
			expect(transaction.id as number | undefined).to.be.undefined;
			expect(transaction.transaction_date as Date | undefined).to.be.undefined;
			expect(transaction.next_due_date as Date | undefined).to.be.undefined;
			expect(transaction.frequency as ScheduleFrequency | undefined).to.be
				.undefined;
			expect(transaction.primary_account as Account | undefined).to.be
				.undefined;
			expect(transaction.status as TransactionStatus | undefined).to.be
				.undefined;
			expect(transaction.related_status as TransactionStatus | undefined).to.be
				.undefined;
		});

		it("should preserve the schedule's flag", (): void => {
			const flag_type: TransactionFlagType = "noreceipt",
				flag = "schedule flag";

			scheduleEditController.transaction.flag_type = flag_type;
			scheduleEditController.transaction.flag = flag;
			scheduleEditController["useLastTransaction"](transaction);
			expect(scheduleEditController.transaction.flag_type).to.equal(flag_type);
			expect(scheduleEditController.transaction.flag).to.equal(flag);
		});

		it("should ignore the previous transaction's flag", (): void => {
			scheduleEditController.transaction.flag_type = null;
			scheduleEditController.transaction.flag = null;
			scheduleEditController["useLastTransaction"](transaction);
			expect(
				scheduleEditController.transaction.flag_type as TransactionFlagType,
			).to.be.null;
			expect(scheduleEditController.transaction.flag as TransactionFlag).to.be
				.null;
		});

		it("should merge the transaction details into vm.transaction", (): void => {
			scheduleEditController["useLastTransaction"](transaction);

			transaction.id = scheduleEditController.transaction.id;
			transaction.transaction_date =
				scheduleEditController.transaction.transaction_date;
			transaction.next_due_date =
				scheduleEditController.transaction.next_due_date;
			transaction.frequency = scheduleEditController.transaction.frequency;
			transaction.primary_account =
				scheduleEditController.transaction.primary_account;
			transaction.status = scheduleEditController.transaction.status;
			transaction.related_status = (
				scheduleEditController.transaction as ScheduledTransferTransaction
			).related_status;
			transaction.payee = (
				scheduleEditController.transaction as ScheduledTransferTransaction
			).payee;
			transaction.category = scheduleEditController.transaction
				.category as PsuedoCategory;

			expect(scheduleEditController.transaction).to.deep.equal(transaction);
		});

		it("should retrigger the amount focus handler if focussed", (): void => {
			currentElement = document.activeElement;
			scheduleEditController["useLastTransaction"](transaction);
			$timeout.flush();
			expect(mockAngularElement.triggerHandler).to.have.been.calledWith(
				"focus",
			);
		});

		it("should not retrigger the amount focus handler if not focussed", (): void => {
			scheduleEditController["useLastTransaction"](transaction);
			expect(mockAngularElement.triggerHandler).to.not.have.been.called;
		});

		afterEach((): void => {
			$timeout.verifyNoPendingTasks();
			angular.element = realAngularElement;
		});
	});

	describe("categorySelected", (): void => {
		describe("(main transaction)", (): void => {
			beforeEach(
				(): Category =>
					(scheduleEditController.transaction.category = createCategory()),
			);

			const scenarios: {
				id: string;
				type: TransactionType;
				direction: TransactionDirection | "the category direction";
				subtransactions?: boolean;
			}[] = [
				{ id: "TransferTo", type: "Transfer", direction: "outflow" },
				{ id: "TransferFrom", type: "Transfer", direction: "inflow" },
				{
					id: "SplitTo",
					type: "Split",
					direction: "outflow",
					subtransactions: true,
				},
				{
					id: "SplitFrom",
					type: "Split",
					direction: "inflow",
					subtransactions: true,
				},
				{
					id: "Payslip",
					type: "Payslip",
					direction: "inflow",
					subtransactions: true,
				},
				{
					id: "LoanRepayment",
					type: "LoanRepayment",
					direction: "outflow",
					subtransactions: true,
				},
				{
					id: "anything else",
					type: "Basic",
					direction: "the category direction",
				},
			];

			scenarios.forEach(
				(scenario: {
					id: string;
					type: TransactionType;
					direction: TransactionDirection | "the category direction";
					subtransactions?: boolean;
				}): void => {
					let subtransactions: SplitTransactionChild[];
					const memo = "test memo",
						amount = 123;

					it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
						(scheduleEditController.transaction.category as PsuedoCategory).id =
							scenario.id;
						scheduleEditController.categorySelected();
						expect(
							scheduleEditController.transaction.transaction_type,
						).to.equal(scenario.type);

						if ("Basic" === scenario.type) {
							expect(scheduleEditController.transaction.direction).to.equal(
								(scheduleEditController.transaction.category as Category)
									.direction,
							);
						} else {
							expect(scheduleEditController.transaction.direction).to.equal(
								scenario.direction,
							);
						}
					});

					if (undefined !== scenario.subtransactions) {
						it(`should not create any stub subtransactions for a ${scenario.id} if some already exist`, (): void => {
							subtransactions = [
								createSubtransferTransaction(),
								createSubtransaction(),
							];
							(
								scheduleEditController.transaction.category as PsuedoCategory
							).id = scenario.id;
							(
								scheduleEditController.transaction as ScheduledSplitTransaction
							).subtransactions = subtransactions;
							scheduleEditController.categorySelected();
							expect(
								(
									scheduleEditController.transaction as ScheduledSplitTransaction
								).subtransactions,
							).to.equal(subtransactions);
						});

						it(`should create four stub subtransactions for a ${scenario.id} if none exist`, (): void => {
							subtransactions = [{ memo, amount }, {}, {}, {}];
							(
								scheduleEditController.transaction.category as PsuedoCategory
							).id = scenario.id;
							delete (
								scheduleEditController.transaction as Partial<ScheduledSplitTransaction>
							).subtransactions;
							scheduleEditController.transaction.memo = memo;
							(
								scheduleEditController.transaction as ScheduledSplitTransaction
							).amount = amount;
							scheduleEditController.categorySelected();
							expect(
								(
									scheduleEditController.transaction as ScheduledSplitTransaction
								).subtransactions,
							).to.deep.equal(subtransactions);
						});
					}
				},
			);

			it("should set the transaction type to Basic if the selected category is not an existing category", (): void => {
				(
					scheduleEditController.transaction as ScheduledBasicTransaction
				).category = "new category";
				scheduleEditController.categorySelected();
				expect(scheduleEditController.transaction.transaction_type).to.equal(
					"Basic",
				);
			});
		});

		describe("(subtransaction)", (): void => {
			beforeEach(
				(): SplitTransactionChild[] =>
					((
						scheduleEditController.transaction as ScheduledSplitTransaction
					).subtransactions = [createSubtransaction()]),
			);

			const scenarios: {
				id: string;
				type: SubtransactionType;
				direction: TransactionDirection | "the category direction";
			}[] = [
				{ id: "TransferTo", type: "Subtransfer", direction: "outflow" },
				{ id: "TransferFrom", type: "Subtransfer", direction: "inflow" },
				{
					id: "anything else",
					type: "Sub",
					direction: "the category direction",
				},
			];

			scenarios.forEach(
				(scenario: {
					id: string;
					type: SubtransactionType;
					direction: TransactionDirection | "the category direction";
				}): void => {
					it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
						(
							(scheduleEditController.transaction as ScheduledSplitTransaction)
								.subtransactions[0].category as PsuedoCategory
						).id = scenario.id;
						scheduleEditController.categorySelected(0);
						expect(
							(scheduleEditController.transaction as ScheduledSplitTransaction)
								.subtransactions[0].transaction_type as SubtransactionType,
						).to.equal(scenario.type);

						if ("Sub" === scenario.type) {
							expect(
								(
									scheduleEditController.transaction as ScheduledSplitTransaction
								).subtransactions[0].direction as TransactionDirection,
							).to.equal(
								(
									(
										scheduleEditController.transaction as ScheduledSplitTransaction
									).subtransactions[0].category as Category
								).direction,
							);
						} else {
							expect(
								(
									scheduleEditController.transaction as ScheduledSplitTransaction
								).subtransactions[0].direction as TransactionDirection,
							).to.equal(scenario.direction);
						}
					});
				},
			);

			it("should set the transaction type to Sub if the selected category is not an existing category", (): void => {
				(
					scheduleEditController.transaction as ScheduledSplitTransaction
				).subtransactions[0].category = "new category";
				scheduleEditController.categorySelected(0);
				expect(
					(scheduleEditController.transaction as ScheduledSplitTransaction)
						.subtransactions[0].transaction_type as SubtransactionType,
				).to.equal("Sub");
			});
		});

		it("should set the direction to outflow if the selected category is not an existing category", (): void => {
			scheduleEditController.categorySelected();
			expect(scheduleEditController.transaction.direction).to.equal("outflow");
		});

		it("should clear the subcategory if it's parent no longer matches the selected category", (): void => {
			(
				scheduleEditController.transaction as ScheduledBasicTransaction
			).subcategory = createCategory({ parent_id: 2 });
			scheduleEditController.categorySelected();
			expect(
				(scheduleEditController.transaction as ScheduledBasicTransaction)
					.subcategory,
			).to.be.null;
		});
	});

	describe("investmentCategorySelected", (): void => {
		beforeEach(
			(): PsuedoCategory =>
				(scheduleEditController.transaction.category = { id: "", name: "" }),
		);

		it("should do nothing if the selected category is not an existing category", (): void => {
			const transactionType: SecurityTransactionType = "SecurityTransfer",
				direction: TransactionDirection = "inflow";

			scheduleEditController.transaction.category = "new category";
			scheduleEditController.transaction.transaction_type = transactionType;
			scheduleEditController.transaction.direction = direction;
			scheduleEditController.investmentCategorySelected();
			expect(scheduleEditController.transaction.transaction_type).to.equal(
				transactionType,
			);
			expect(scheduleEditController.transaction.direction).to.equal(direction);
		});

		const scenarios: {
			id: string;
			type: SecurityTransactionType;
			direction: TransactionDirection;
		}[] = [
			{ id: "TransferTo", type: "SecurityTransfer", direction: "outflow" },
			{ id: "TransferFrom", type: "SecurityTransfer", direction: "inflow" },
			{ id: "RemoveShares", type: "SecurityHolding", direction: "outflow" },
			{ id: "AddShares", type: "SecurityHolding", direction: "inflow" },
			{ id: "Sell", type: "SecurityInvestment", direction: "outflow" },
			{ id: "Buy", type: "SecurityInvestment", direction: "inflow" },
			{ id: "DividendTo", type: "Dividend", direction: "outflow" },
		];

		scenarios.forEach(
			(scenario: {
				id: string;
				type: SecurityTransactionType;
				direction: TransactionDirection;
			}): void => {
				it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
					(scheduleEditController.transaction.category as PsuedoCategory).id =
						scenario.id;
					scheduleEditController.investmentCategorySelected();
					expect(scheduleEditController.transaction.transaction_type).to.equal(
						scenario.type,
					);
					expect(scheduleEditController.transaction.direction).to.equal(
						scenario.direction,
					);
				});
			},
		);

		it("should not set the transaction type or direction if the category is not recognised", (): void => {
			const transactionType: SecurityTransactionType = "SecurityTransfer",
				direction: TransactionDirection = "inflow";

			(scheduleEditController.transaction.category as PsuedoCategory).id =
				"unknown";
			scheduleEditController.transaction.transaction_type = transactionType;
			scheduleEditController.transaction.direction = direction;
			scheduleEditController.investmentCategorySelected();
			expect(scheduleEditController.transaction.transaction_type).to.equal(
				transactionType,
			);
			expect(scheduleEditController.transaction.direction).to.equal(direction);
		});
	});

	describe("primaryAccountSelected", (): void => {
		beforeEach(
			(): Account =>
				(scheduleEditController.transaction.primary_account = createAccount({
					id: 1,
				})),
		);

		it("should clear the category and subcategory if the account type no longer matches the primary account type", (): void => {
			scheduleEditController["account_type"] = "cash";
			scheduleEditController.primaryAccountSelected();
			expect(
				(scheduleEditController.transaction as CategorisableTransaction)
					.category,
			).to.be.null;
			expect(
				(scheduleEditController.transaction as SubcategorisableTransaction)
					.subcategory,
			).to.be.null;
		});

		it("should set the account type to the primary account type", (): void => {
			scheduleEditController.primaryAccountSelected();
			expect(scheduleEditController["account_type"] as AccountType).to.equal(
				"bank",
			);
		});

		it("should set the account type to null when there is no primary account", (): void => {
			delete (
				scheduleEditController.transaction as Partial<ScheduledTransaction>
			).primary_account;
			scheduleEditController.primaryAccountSelected();
			expect(scheduleEditController["account_type"]).to.be.null;
		});

		it("should do nothing when the transfer account is null", (): void => {
			(
				scheduleEditController.transaction as ScheduledTransferTransaction
			).account = null;
			scheduleEditController.primaryAccountSelected();
			expect(
				(scheduleEditController.transaction as ScheduledTransferTransaction)
					.account,
			).to.be.null;
		});

		it("should do nothing when the transfer account is undefined", (): void => {
			delete (
				scheduleEditController.transaction as Partial<ScheduledTransferTransaction>
			).account;
			scheduleEditController.primaryAccountSelected();
			expect(scheduleEditController.transaction).to.not.have.property(
				"account",
			);
		});

		it("should clear the transfer account when the primary account matches", (): void => {
			(
				scheduleEditController.transaction as ScheduledTransferTransaction
			).account = createAccount({ id: 1 });
			scheduleEditController.primaryAccountSelected();
			expect(
				(scheduleEditController.transaction as ScheduledTransferTransaction)
					.account,
			).to.be.null;
		});
	});

	describe("$watch subtransations", (): void => {
		let subtransactions: Partial<Subtransaction>[];

		beforeEach((): void => {
			subtransactions = [
				createSubtransaction({ amount: 10, direction: "outflow" }),
				createSubtransaction({ amount: 5, direction: "inflow" }),
				{},
			];
			sinon.stub(scheduleEditController, "memoFromSubtransactions");

			scheduleEditController.transaction.direction = "outflow";
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = [{}, {}];
			(scheduleEditController as angular.IController).$scope.$digest();
		});

		it("should do nothing if the watched value hasn't changed", (): void => {
			(scheduleEditController as angular.IController).$scope.$digest();
			expect(scheduleEditController.totalAllocated).to.be.null;
		});

		it("should do nothing if there are no subtransactions", (): void => {
			delete (
				scheduleEditController.transaction as Partial<ScheduledSplitTransaction>
			).subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			expect(scheduleEditController.totalAllocated).to.be.null;
		});

		it("should calculate the total and make it available to the view", (): void => {
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			expect(scheduleEditController.totalAllocated as number).to.equal(5);
		});

		it("should not set the main transaction memo when editing an existing transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			expect(scheduleEditController["memoFromSubtransactions"]).to.not.have.been
				.called;
		});

		it("should set the main transaction memo when adding a new transaction", (): void => {
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = subtransactions;
			(scheduleEditController as angular.IController).$scope.$digest();
			expect(scheduleEditController["memoFromSubtransactions"]).to.have.been
				.called;
		});
	});

	describe("memoFromSubtransactions", (): void => {
		beforeEach((): void => {
			const memo = "memo";

			scheduleEditController.transaction.memo = memo;
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = [
				createSubtransaction({ memo: "memo 1" }),
				createSubtransaction({ memo: "memo 2" }),
				{},
			];
		});

		it("should join the sub transaction memos and set the main transaction memo when adding a new transaction", (): void => {
			scheduleEditController.memoFromSubtransactions();
			expect(scheduleEditController.transaction.memo).to.equal(
				"memo 1; memo 2",
			);
		});
	});

	describe("primaryAccounts", (): void => {
		let accounts: angular.IPromise<Account[]>;

		beforeEach(
			(): angular.IPromise<Account[]> =>
				(accounts = scheduleEditController.primaryAccounts("a", 3)),
		);

		it("should fetch the list of accounts", (): Chai.Assertion =>
			expect(accountModel.all).to.have.been.called);

		it("should return a filtered & limited list of accounts", async (): Promise<Chai.Assertion> =>
			expect(await accounts).to.deep.equal([
				createAccount({
					id: 1,
					name: "aa",
					closing_balance: 100,
					opening_balance: 100,
					cleared_closing_balance: 1.01,
					reconciled_closing_balance: 15.003,
				}),
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" }),
			]));
	});

	describe("accounts", (): void => {
		it("should fetch the list of accounts", (): void => {
			scheduleEditController.accounts("a", 2);
			expect(accountModel.all).to.have.been.called;
		});

		it("should remove the current account from the list", async (): Promise<void> => {
			scheduleEditController.transaction.primary_account = createAccount({
				name: "aa",
			});
			expect(await scheduleEditController.accounts("a", 2)).to.deep.equal([
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" }),
			]);
		});

		it("should not filter the list if there is no current account", async (): Promise<void> => {
			delete (
				scheduleEditController.transaction as Partial<ScheduledTransaction>
			).primary_account;
			expect(await scheduleEditController.accounts("a", 2)).to.deep.equal([
				createAccount({
					id: 1,
					name: "aa",
					closing_balance: 100,
					opening_balance: 100,
					cleared_closing_balance: 1.01,
					reconciled_closing_balance: 15.003,
				}),
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
			]);
		});

		it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", async (): Promise<Chai.Assertion> =>
			expect(await scheduleEditController.accounts("b", 2)).to.deep.equal([
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" }),
			]));

		it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", async (): Promise<void> => {
			scheduleEditController.transaction.transaction_type = "SecurityTransfer";
			expect(await scheduleEditController.accounts("b", 2)).to.deep.equal([
				createAccount({ id: 2, name: "bb", account_type: "investment" }),
				createAccount({ id: 6, name: "bc", account_type: "investment" }),
			]);
		});
	});

	describe("frequencies", (): void => {
		it("should return the full list of frequencies when a filter is not specified", (): Chai.Assertion =>
			expect(scheduleEditController.frequencies()).to.deep.equal([
				"Weekly",
				"Fortnightly",
				"Monthly",
				"Bimonthly",
				"Quarterly",
				"Yearly",
			]));

		it("should return a filtered list of frequencies when a filter is specified", (): Chai.Assertion =>
			expect(scheduleEditController.frequencies("t")).to.deep.equal([
				"Fortnightly",
				"Monthly",
				"Bimonthly",
				"Quarterly",
			]));
	});

	describe("addSubtransaction", (): void => {
		it("should add an empty object to the subtransactions array", (): void => {
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = [];
			scheduleEditController.addSubtransaction();
			expect(
				(scheduleEditController.transaction as ScheduledSplitTransaction)
					.subtransactions,
			).to.deep.equal([{}]);
		});
	});

	describe("deleteSubtransaction", (): void => {
		it("should remove an item from the subtransactions array at the specified index", (): void => {
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = [
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 2 }),
				createSubtransaction({ id: 3 }),
			];
			scheduleEditController.deleteSubtransaction(1);
			expect(
				(scheduleEditController.transaction as ScheduledSplitTransaction)
					.subtransactions,
			).to.deep.equal([
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 3 }),
			]);
		});
	});

	describe("addUnallocatedAmount", (): void => {
		beforeEach((): void => {
			(scheduleEditController.transaction as ScheduledSplitTransaction).amount =
				100;
			scheduleEditController.totalAllocated = 80;
			(
				scheduleEditController.transaction as ScheduledSplitTransaction
			).subtransactions = [
				createSubtransaction({ amount: 80 }),
				createSubtransaction({ amount: undefined }),
			];
		});

		it("should increase an existing subtransaction amount by the unallocated amount", (): void => {
			scheduleEditController.addUnallocatedAmount(0);
			expect(
				(scheduleEditController.transaction as ScheduledSplitTransaction)
					.subtransactions[0].amount as number,
			).to.equal(100);
		});

		it("should set a blank subtransaction amount to the unallocated amount", (): void => {
			scheduleEditController.addUnallocatedAmount(1);
			expect(
				(scheduleEditController.transaction as ScheduledSplitTransaction)
					.subtransactions[1].amount as number,
			).to.equal(20);
		});
	});

	describe("calculateNextDue", (): void => {
		const scenarios: {
			frequency: ScheduleFrequency;
			period: string;
			amount: number;
			addFn: (date: Date, amount: number) => Date;
		}[] = [
			{ frequency: "Weekly", period: "weeks", amount: 1, addFn: addWeeks },
			{ frequency: "Fortnightly", period: "weeks", amount: 2, addFn: addWeeks },
			{ frequency: "Monthly", period: "month", amount: 1, addFn: addMonths },
			{ frequency: "Bimonthly", period: "month", amount: 2, addFn: addMonths },
			{
				frequency: "Quarterly",
				period: "quarters",
				amount: 1,
				addFn: addQuarters,
			},
			{ frequency: "Yearly", period: "year", amount: 1, addFn: addYears },
		];

		scenarios.forEach(
			(scenario: {
				frequency: ScheduleFrequency;
				period: string;
				amount: number;
				addFn: (date: Date, amount: number) => Date;
			}): void => {
				it(`should add ${scenario.amount} ${scenario.period} to the next due date when the frequency is ${scenario.frequency}`, (): void => {
					const nextDueDate: Date = scheduleEditController.schedule
						.next_due_date as Date;

					scheduleEditController.schedule.frequency = scenario.frequency;
					scheduleEditController["calculateNextDue"]();
					expect(scheduleEditController.schedule.next_due_date).to.deep.equal(
						scenario.addFn(nextDueDate, scenario.amount),
					);
				});
			},
		);

		it("should decrement the overdue count when greater than zero", (): void => {
			scheduleEditController.schedule.overdue_count = 1;
			scheduleEditController.schedule.frequency = "Weekly";
			scheduleEditController["calculateNextDue"]();
			expect(scheduleEditController.schedule.overdue_count).to.equal(0);
		});

		it("should leave the overdue account unchanged when zero", (): void => {
			scheduleEditController.schedule.overdue_count = 0;
			scheduleEditController.schedule.frequency = "Weekly";
			scheduleEditController["calculateNextDue"]();
			expect(scheduleEditController.schedule.overdue_count).to.equal(0);
		});
	});

	describe("updateInvestmentDetails", (): void => {
		let amount: number, memo: string;

		beforeEach((): void => {
			amount = 100;
			memo = "memo";
			scheduleEditController.transaction.id = null;
			scheduleEditController.transaction.transaction_type =
				"SecurityInvestment";
			(
				scheduleEditController.transaction as ScheduledSecurityHoldingTransaction
			).quantity = 2;
			(
				scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction
			).price = 10;
			(
				scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction
			).commission = 1;
			(
				scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction
			).amount = amount;
			scheduleEditController.transaction.memo = memo;
		});

		it("should do nothing when the transaction type is not SecurityInvestment", (): void => {
			scheduleEditController.transaction.transaction_type = "Basic";
			scheduleEditController.updateInvestmentDetails();
			expect(
				(scheduleEditController.transaction as ScheduledBasicTransaction)
					.amount,
			).to.equal(amount);
			expect(scheduleEditController.transaction.memo).to.equal(memo);
		});

		it("should not update the memo when editing an existing Security Investment transaction", (): void => {
			scheduleEditController.transaction.id = 1;
			scheduleEditController.updateInvestmentDetails();
			expect(scheduleEditController.transaction.memo).to.equal(memo);
		});

		const scenarios: {
			direction: TransactionDirection;
			amount: number;
			memo: string;
		}[] = [
			{ direction: "outflow", amount: 19, memo: "less" },
			{ direction: "inflow", amount: 21, memo: "plus" },
		];

		scenarios.forEach(
			(scenario: {
				direction: TransactionDirection;
				amount: number;
				memo: string;
			}): void => {
				it(`should set the transaction amount to zero and the memo to an empty string if the price, quantity and commission are not specified for a Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
					scheduleEditController.transaction.direction = scenario.direction;
					delete (
						scheduleEditController.transaction as Partial<ScheduledSecurityInvestmentTransaction>
					).quantity;
					delete (
						scheduleEditController.transaction as Partial<ScheduledSecurityInvestmentTransaction>
					).price;
					delete (
						scheduleEditController.transaction as Partial<ScheduledSecurityInvestmentTransaction>
					).commission;
					scheduleEditController.updateInvestmentDetails();
					expect(
						(
							scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction
						).amount,
					).to.equal(0);
					expect(scheduleEditController.transaction.memo).to.be.empty;
				});

				it(`should calculate the transaction amount from the price, quantity and commission for a Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
					scheduleEditController.transaction.direction = scenario.direction;
					scheduleEditController.updateInvestmentDetails();
					expect(
						(
							scheduleEditController.transaction as ScheduledSecurityInvestmentTransaction
						).amount,
					).to.equal(scenario.amount);
				});

				it(`should update the memo with the price, quantity and commission when adding a new Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
					scheduleEditController.transaction.direction = scenario.direction;
					scheduleEditController.updateInvestmentDetails();
					expect(scheduleEditController.transaction.memo).to.equal(
						`2.0000 @ $10.000 (${scenario.memo} $1.00 commission)`,
					);
				});
			},
		);
	});

	describe("edit", (): void => {
		beforeEach((): void => scheduleEditController.edit());

		it("should set the mode to Edit Schedule", (): Chai.Assertion =>
			expect(scheduleEditController.mode).to.equal("Edit Schedule"));

		it("should set the transaction to the schedule", (): Chai.Assertion =>
			expect(scheduleEditController.transaction).to.equal(
				scheduleEditController.schedule,
			));
	});

	describe("enter", (): void => {
		beforeEach((): void => {
			sinon.stub(scheduleEditController, "skip");
			scheduleEditController.transaction.id = 1;
		});

		it("should reset any previous error messages", (): void => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.enter();
			expect(scheduleEditController.errorMessage as string | null).to.be.null;
		});

		it("should save the schedule", (): void => {
			scheduleEditController.enter();
			expect(transactionModel.save).to.have.been.calledWith(
				scheduleEditController.transaction,
			);
		});

		it("should update the next due date when the transaction save is successful", (): void => {
			scheduleEditController.enter();
			expect(scheduleEditController["skip"]).to.have.been.called;
		});

		it("should display an error message when the transaction save is unsuccessful", (): void => {
			scheduleEditController.transaction.id = -1;
			scheduleEditController.enter();
			expect(scheduleEditController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("skip", (): void => {
		beforeEach((): void => {
			sinon.stub(
				scheduleEditController,
				"calculateNextDue" as keyof ScheduleEditController,
			);
			sinon.stub(scheduleEditController, "save");
			scheduleEditController.skip();
		});

		it("should calculate the next due date", (): Chai.Assertion =>
			expect(scheduleEditController["calculateNextDue"]).to.have.been.called);

		it("should save the schedule", (): Chai.Assertion =>
			expect(scheduleEditController["save"]).to.have.been.calledWith(true));
	});

	describe("save", (): void => {
		it("should reset any previous error messages", (): void => {
			scheduleEditController.errorMessage = "error message";
			scheduleEditController.save();
			expect(scheduleEditController.errorMessage as string | null).to.be.null;
		});

		it("should set the flag memo to '(no memo)' if the auto-flag property is set and the memo is blank", (): void => {
			scheduleEditController.schedule.autoFlag = true;
			scheduleEditController.save();
			expect(scheduleEditController.schedule.flag as string).to.equal(
				"(no memo)",
			);
		});

		it("should preserve the flag memo if the auto-flag property is set", (): void => {
			scheduleEditController.schedule.autoFlag = true;
			scheduleEditController.schedule.flag = "Test flag";
			scheduleEditController.save();
			expect(scheduleEditController.schedule.flag).to.equal("Test flag");
		});

		it("should set the flag to null if the auto-flag property is not set", (): void => {
			scheduleEditController.schedule.flag_type = "noreceipt";
			scheduleEditController.schedule.flag = "Test flag";
			scheduleEditController.save();
			expect(scheduleEditController.schedule.flag_type as string | null).to.be
				.null;
			expect(scheduleEditController.schedule.flag as string | null).to.be.null;
		});

		it("should save the schedule", (): void => {
			scheduleEditController.save();
			expect(scheduleModel.save).to.have.been.calledWith(schedule);
		});

		it("should close the modal when the schedule save is successful", (): void => {
			scheduleEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith({
				data: schedule,
				skipped: false,
			});
		});

		it("should mark the schedule as skipped when the skipped parameter is true", (): void => {
			scheduleEditController.save(true);
			expect($uibModalInstance.close).to.have.been.calledWith({
				data: schedule,
				skipped: true,
			});
		});

		it("should display an error message when the schedule save is unsuccessful", (): void => {
			scheduleEditController.schedule.id = -1;
			scheduleEditController.save();
			expect(scheduleEditController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			scheduleEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
