import type {
	BasicTransaction,
	PayeeCashTransaction,
	PayeeTransactionType,
	SecurityHoldingTransaction,
	SecurityInvestmentTransaction,
	SecurityTransaction,
	SecurityTransactionType,
	SplitTransaction,
	SplitTransactionChild,
	SplitTransactionType,
	Subtransaction,
	SubtransactionType,
	SubtransferTransaction,
	Transaction,
	TransactionDirection,
	TransactionStatus,
	TransactionType,
	TransferTransaction,
	TransferrableTransaction,
} from "~/transactions/types";
import type {
	Category,
	DisplayCategory,
	PsuedoCategory,
} from "~/categories/types";
import {
	createBasicTransaction,
	createSplitTransaction,
	createSubtransaction,
	createSubtransferTransaction,
	createTransferTransaction,
} from "~/mocks/transactions/factories";
import type { Account } from "~/accounts/types";
import type { AccountModelMock } from "~/mocks/accounts/types";
import type { CategoryModelMock } from "~/mocks/categories/types";
import type { ControllerTestFactory } from "~/mocks/types";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Payee } from "~/payees/types";
import type { PayeeModelMock } from "~/mocks/payees/types";
import type { Security } from "~/securities/types";
import type { SecurityModelMock } from "~/mocks/securities/types";
import type { SinonStub } from "sinon";
import type TransactionEditController from "~/transactions/controllers/edit";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import type { UibModalInstanceMock } from "~/mocks/node-modules/angular/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import createCategory from "~/mocks/categories/factories";
import createPayee from "~/mocks/payees/factories";
import createSecurity from "~/mocks/securities/factories";
import sinon from "sinon";

describe("TransactionEditController", (): void => {
	let transactionEditController: TransactionEditController,
		controllerTest: ControllerTestFactory,
		$uibModalInstance: UibModalInstanceMock,
		$timeout: angular.ITimeoutService,
		payeeModel: PayeeModelMock,
		securityModel: SecurityModelMock,
		categoryModel: CategoryModelMock,
		accountModel: AccountModelMock,
		transactionModel: TransactionModelMock,
		transaction: Transaction;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModalInstance",
					"$q",
					"payeeModel",
					"securityModel",
					"categoryModel",
					"accountModel",
					"transactionModel",
					"ogModalErrorService",
					"transaction",
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
				_transaction_: Transaction,
			): void => {
				controllerTest = _controllerTest_;
				$uibModalInstance = _$uibModalInstance_;
				$timeout = _$timeout_;
				payeeModel = _payeeModel_;
				securityModel = _securityModel_;
				categoryModel = _categoryModel_;
				accountModel = _accountModel_;
				transactionModel = _transactionModel_;
				transaction = _transaction_;
				transactionEditController = controllerTest(
					"TransactionEditController",
				) as TransactionEditController;
			},
		) as Mocha.HookFunction,
	);

	describe("when a transaction is provided", (): void => {
		it("should make the passed transaction available to the view", (): Chai.Assertion =>
			expect(transactionEditController.transaction).to.deep.equal(transaction));

		it("should set the mode to Edit", (): Chai.Assertion =>
			expect(transactionEditController.mode).to.equal("Edit"));
	});

	describe("when a transaction is not provided", (): void => {
		beforeEach(
			(): TransactionEditController =>
				(transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: {} },
				) as TransactionEditController),
		);

		it("should make the passed transaction available to the view", (): void => {
			expect(transactionEditController.transaction).to.be.an("object");
			expect(transactionEditController.transaction).to.deep.equal({ id: null });
		});

		it("should set the mode to Add", (): Chai.Assertion =>
			expect(transactionEditController.mode).to.equal("Add"));
	});

	it("should prefetch the payees list to populate the cache", (): Chai.Assertion =>
		expect(payeeModel.all).to.have.been.called);

	describe("payees", (): void => {
		let payees: angular.IPromise<Payee[]>;

		beforeEach(
			(): angular.IPromise<Payee[]> =>
				(payees = transactionEditController.payees("a", 3)),
		);

		it("should fetch the list of payees", (): Chai.Assertion =>
			expect(payeeModel.all).to.have.been.called);

		it("should return a filtered & limited list of payees", async (): Promise<Chai.Assertion> =>
			expect(await payees).to.deep.equal([
				{
					id: 1,
					name: "aa",
					closing_balance: 0,
					favourite: false,
					num_transactions: 0,
				},
				{
					id: 4,
					name: "ba",
					closing_balance: 0,
					favourite: false,
					num_transactions: 0,
				},
				{
					id: 5,
					name: "ab",
					closing_balance: 0,
					favourite: false,
					num_transactions: 0,
				},
			]));
	});

	describe("securities", (): void => {
		let securities: angular.IPromise<Security[]>;

		beforeEach(
			(): angular.IPromise<Security[]> =>
				(securities = transactionEditController.securities("a", 3)),
		);

		it("should fetch the list of securities", (): Chai.Assertion =>
			expect(securityModel.all).to.have.been.called);

		it("should return a filtered & limited list of securities", async (): Promise<Chai.Assertion> =>
			expect(await securities).to.deep.equal([
				{
					id: 1,
					name: "aa",
					closing_balance: 1.006,
					code: "A",
					current_holding: 1,
					favourite: false,
					unused: false,
					num_transactions: 0,
				},
				{
					id: 4,
					name: "ba",
					closing_balance: 4,
					code: "D",
					current_holding: 1,
					favourite: false,
					unused: false,
					num_transactions: 0,
				},
				{
					id: 5,
					name: "ab",
					closing_balance: 5,
					code: "E",
					current_holding: 1,
					favourite: false,
					unused: false,
					num_transactions: 0,
				},
			]));
	});

	describe("categories", (): void => {
		it("should return an empty array if the parent category is new", (): void => {
			const categories:
				| angular.IPromise<DisplayCategory[]>
				| DisplayCategory[] = transactionEditController.categories(
				"a",
				3,
				{} as Category,
			);

			expect(categories).to.be.an("array");
			expect(categories).to.be.empty;
		});

		describe("(parent categories)", (): void => {
			it("should fetch the list of parent categories", (): void => {
				transactionEditController.categories("a", 3);
				expect(categoryModel.all).to.have.been.calledWith(undefined);
			});

			it("should include transfer categories", async (): Promise<Chai.Assertion> =>
				expect(
					await transactionEditController.categories("a", 5),
				).to.deep.equal([
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
					await transactionEditController.categories("a", 7, null, true),
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
				transactionEditController.categories("a", 3, createCategory({ id: 1 }));
				expect(categoryModel.all).to.have.been.calledWith(1);
			});

			it("should eventually return a filtered & limited list of subcategories", async (): Promise<Chai.Assertion> =>
				expect(
					await transactionEditController.categories(
						"a",
						3,
						createCategory({ id: 1 }),
					),
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
			expect(transactionEditController.investmentCategories()).to.deep.equal([
				{ id: "Buy", name: "Buy" },
				{ id: "Sell", name: "Sell" },
				{ id: "DividendTo", name: "Dividend To" },
				{ id: "AddShares", name: "Add Shares" },
				{ id: "RemoveShares", name: "Remove Shares" },
				{ id: "TransferTo", name: "Transfer To" },
				{ id: "TransferFrom", name: "Transfer From" },
			]));

		it("should return a filtered list of investment categories when a filter is specified", (): Chai.Assertion =>
			expect(transactionEditController.investmentCategories("a")).to.deep.equal(
				[
					{ id: "AddShares", name: "Add Shares" },
					{ id: "RemoveShares", name: "Remove Shares" },
					{ id: "TransferTo", name: "Transfer To" },
					{ id: "TransferFrom", name: "Transfer From" },
				],
			));
	});

	describe("isString", (): void => {
		it("should return false if the object is not a string", (): Chai.Assertion =>
			expect(transactionEditController.isString({})).to.be.false);

		it("should return false if the object is an empty string", (): Chai.Assertion =>
			expect(transactionEditController.isString("")).to.be.false);

		it("should return true if the object is a string and is not empty", (): Chai.Assertion =>
			expect(transactionEditController.isString("test")).to.be.true);
	});

	describe("payeeSelected", (): void => {
		let payee: Payee, primaryAccount: Account;

		beforeEach((): void => {
			transactionEditController.transaction.id = null;
			payee = createPayee();
			primaryAccount = createAccount();
			(transactionEditController.transaction as PayeeCashTransaction).payee =
				payee;
			transactionEditController.transaction.primary_account = primaryAccount;
			sinon.stub(
				transactionEditController,
				"getSubtransactions" as keyof TransactionEditController,
			);
			sinon.stub(
				transactionEditController,
				"useLastTransaction" as keyof TransactionEditController,
			);
		});

		it("should do nothing when editing an existing transaction", (): void => {
			transactionEditController.transaction.id = 1;
			(transactionEditController.transaction as PayeeCashTransaction).payee =
				payee;
			transactionEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when the selected payee is not an existing payee", (): void => {
			(transactionEditController.transaction as PayeeCashTransaction).payee =
				"payee";
			transactionEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			(
				(transactionEditController.transaction as PayeeCashTransaction)
					.payee as Payee
			).id = -1;
			transactionEditController.payeeSelected();
			expect(transactionEditController.loadingLastTransaction).to.be.true;
		});

		it("should fetch the last transaction for the selected payee", (): void => {
			transactionEditController.payeeSelected();
			expect(payeeModel.findLastTransaction).to.have.been.calledWith(
				payee.id,
				primaryAccount.account_type,
			);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			transactionEditController.payeeSelected();
			expect(transactionEditController["getSubtransactions"]).to.have.been
				.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			transactionEditController.payeeSelected();
			expect(transactionEditController["useLastTransaction"]).to.have.been
				.called;
		});

		it("should hide the loading indicator", (): void => {
			transactionEditController.payeeSelected();
			expect(transactionEditController.loadingLastTransaction).to.be.false;
		});
	});

	describe("securitySelected", (): void => {
		let security: Security, primaryAccount: Account;

		beforeEach((): void => {
			transactionEditController.transaction.id = null;
			security = createSecurity();
			primaryAccount = createAccount();
			(transactionEditController.transaction as SecurityTransaction).security =
				security;
			transactionEditController.transaction.primary_account = primaryAccount;
			sinon.stub(
				transactionEditController,
				"getSubtransactions" as keyof TransactionEditController,
			);
			sinon.stub(
				transactionEditController,
				"useLastTransaction" as keyof TransactionEditController,
			);
		});

		it("should do nothing when editing an existing transaction", (): void => {
			transactionEditController.transaction.id = 1;
			(transactionEditController.transaction as SecurityTransaction).security =
				security;
			transactionEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.not.have.been.called;
		});

		it("should do nothing when the selected security is not an existing security", (): void => {
			(transactionEditController.transaction as SecurityTransaction).security =
				"security";
			transactionEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.not.have.been.called;
		});

		it("should show a loading indicator", (): void => {
			(
				(transactionEditController.transaction as SecurityTransaction)
					.security as Security
			).id = -1;
			transactionEditController.securitySelected();
			expect(transactionEditController.loadingLastTransaction).to.be.true;
		});

		it("should fetch the last transaction for the selected security", (): void => {
			transactionEditController.securitySelected();
			expect(securityModel.findLastTransaction).to.have.been.calledWith(
				security.id,
				primaryAccount.account_type,
			);
		});

		it("should fetch the subtransactions for the last transaction", (): void => {
			transactionEditController.securitySelected();
			expect(transactionEditController["getSubtransactions"]).to.have.been
				.called;
		});

		it("should default the transaction details from the last transaction", (): void => {
			transactionEditController.securitySelected();
			expect(transactionEditController["useLastTransaction"]).to.have.been
				.called;
		});

		it("should hide the loading indicator", (): void => {
			transactionEditController.securitySelected();
			expect(transactionEditController.loadingLastTransaction).to.be.false;
		});
	});

	describe("getSubtransactions", (): void => {
		describe("when a transaction is not provided", (): void => {
			it("should return undefined", (): Chai.Assertion =>
				expect(transactionEditController["getSubtransactions"]()).to.be
					.undefined);
		});

		describe("when a transaction is provided", (): void => {
			let splitTransaction: SplitTransaction;

			beforeEach(
				(): SplitTransaction => (splitTransaction = createSplitTransaction()),
			);

			it("should return the transaction if it is not a split, loan repayment or payslip", (): void => {
				const basicTransaction: BasicTransaction = createBasicTransaction();

				expect(
					transactionEditController["getSubtransactions"](
						basicTransaction,
					) as BasicTransaction,
				).to.deep.equal(basicTransaction);
			});

			const scenarios: SplitTransactionType[] = [
				"Split",
				"LoanRepayment",
				"Payslip",
			];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it("should fetch the subtransactions for the transaction", (): void => {
					splitTransaction.transaction_type = scenario;
					transactionEditController["getSubtransactions"](splitTransaction);
					expect(splitTransaction.subtransactions).to.be.an("array");
					expect(transactionModel.findSubtransactions).to.have.been.calledWith(
						splitTransaction.id,
					);
				});
			});

			it("should eventually return a list of subtransactions stripped of their ids", async (): Promise<void> => {
				const expected: SplitTransaction = angular.copy(splitTransaction);

				expected.subtransactions = [
					createSubtransferTransaction({ id: null }),
					createSubtransaction({ id: null }),
					createSubtransaction({ id: null }),
				];

				expect(
					(await transactionEditController["getSubtransactions"](
						splitTransaction,
					)) as SplitTransaction,
				).to.deep.equal(expected);
			});
		});
	});

	describe("useLastTransaction", (): void => {
		let lastTransaction: TransferTransaction,
			currentElement: Element | null,
			mockAngularElement: { triggerHandler: SinonStub },
			realAngularElement: JQueryStatic;

		beforeEach((): void => {
			// The previous transaction to merge
			lastTransaction = createTransferTransaction({
				flag_type: "noreceipt",
				flag: "flag",
			});

			// The current transaction to merge into
			transactionEditController.transaction = createTransferTransaction({
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
			transactionEditController["useLastTransaction"]();
			expect(lastTransaction.id as number | undefined).to.not.be.undefined;
		});

		it("should strip the transaction of it's id, date, primary account, status, related status & flag", (): void => {
			transactionEditController["useLastTransaction"](lastTransaction);
			expect(lastTransaction.id as number | undefined).to.be.undefined;
			expect(lastTransaction.transaction_date as Date | undefined).to.be
				.undefined;
			expect(lastTransaction.primary_account as Account | undefined).to.be
				.undefined;
			expect(lastTransaction.status as TransactionStatus | undefined).to.be
				.undefined;
			expect(lastTransaction.related_status as TransactionStatus | undefined).to
				.be.undefined;
			expect(lastTransaction.flag_type).to.be.undefined;
			expect(lastTransaction.flag).to.be.undefined;
		});

		it("should merge the transaction details into vm.transaction", (): void => {
			transactionEditController["useLastTransaction"](lastTransaction);

			lastTransaction.id = transactionEditController.transaction.id;
			lastTransaction.transaction_date =
				transactionEditController.transaction.transaction_date;
			lastTransaction.primary_account =
				transactionEditController.transaction.primary_account;
			lastTransaction.status = transactionEditController.transaction.status;
			lastTransaction.related_status = (
				transactionEditController.transaction as TransferTransaction
			).related_status;
			lastTransaction.payee = (
				transactionEditController.transaction as TransferTransaction
			).payee;
			lastTransaction.category = transactionEditController.transaction
				.category as PsuedoCategory;
			lastTransaction.flag_type =
				transactionEditController.transaction.flag_type;
			lastTransaction.flag = transactionEditController.transaction.flag;

			expect(transactionEditController.transaction).to.deep.equal(
				lastTransaction,
			);
		});

		it("should retrigger the focus handler of a refocussable field if focussed", (): void => {
			currentElement = document.activeElement;
			transactionEditController["useLastTransaction"](lastTransaction);
			$timeout.flush();
			expect(mockAngularElement.triggerHandler).to.have.been.calledWith(
				"focus",
			);
		});

		it("should not retrigger the amount focus handler of a refocussable field if not focussed", (): void => {
			transactionEditController["useLastTransaction"](lastTransaction);
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
					(transactionEditController.transaction.category = createCategory()),
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
					const memo = "test memo",
						amount = 123;
					let subtransactions: SplitTransactionChild[];

					it(`should set the transaction type to ${scenario.type} and the direction to ${scenario.direction} if the category is ${scenario.id}`, (): void => {
						(
							transactionEditController.transaction.category as PsuedoCategory
						).id = scenario.id;
						transactionEditController.categorySelected();
						expect(
							transactionEditController.transaction.transaction_type,
						).to.equal(scenario.type);

						if ("Basic" === scenario.type) {
							expect(transactionEditController.transaction.direction).to.equal(
								(transactionEditController.transaction.category as Category)
									.direction,
							);
						} else {
							expect(transactionEditController.transaction.direction).to.equal(
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
								transactionEditController.transaction.category as PsuedoCategory
							).id = scenario.id;
							(
								transactionEditController.transaction as SplitTransaction
							).subtransactions = subtransactions;
							transactionEditController.categorySelected();
							expect(
								(transactionEditController.transaction as SplitTransaction)
									.subtransactions,
							).to.equal(subtransactions);
						});

						it(`should create four stub subtransactions for a ${scenario.id} if none exist`, (): void => {
							subtransactions = [{ memo, amount }, {}, {}, {}];
							(
								transactionEditController.transaction.category as PsuedoCategory
							).id = scenario.id;
							delete (
								transactionEditController.transaction as Partial<SplitTransaction>
							).subtransactions;
							transactionEditController.transaction.memo = memo;
							(
								transactionEditController.transaction as SplitTransaction
							).amount = amount;
							transactionEditController.categorySelected();
							expect(
								(transactionEditController.transaction as SplitTransaction)
									.subtransactions,
							).to.deep.equal(subtransactions);
						});
					}
				},
			);

			it("should set the transaction type to Basic if the selected category is not an existing category", (): void => {
				transactionEditController.transaction.category = "new category";
				transactionEditController.categorySelected();
				expect(transactionEditController.transaction.transaction_type).to.equal(
					"Basic",
				);
			});
		});

		describe("(subtransaction)", (): void => {
			beforeEach(
				(): SplitTransactionChild[] =>
					((
						transactionEditController.transaction as SplitTransaction
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
							(transactionEditController.transaction as SplitTransaction)
								.subtransactions[0].category as PsuedoCategory
						).id = scenario.id;
						transactionEditController.categorySelected(0);
						expect(
							(transactionEditController.transaction as SplitTransaction)
								.subtransactions[0].transaction_type as SubtransactionType,
						).to.equal(scenario.type);

						if ("Sub" === scenario.type) {
							expect(
								(transactionEditController.transaction as SplitTransaction)
									.subtransactions[0].direction as TransactionDirection,
							).to.equal(
								(
									(transactionEditController.transaction as SplitTransaction)
										.subtransactions[0].category as Category
								).direction,
							);
						} else {
							expect(
								(transactionEditController.transaction as SplitTransaction)
									.subtransactions[0].direction as TransactionDirection,
							).to.equal(scenario.direction);
						}
					});
				},
			);

			it("should set the transaction type to Sub if the selected category is not an existing category", (): void => {
				(
					transactionEditController.transaction as SplitTransaction
				).subtransactions[0].category = "new category";
				transactionEditController.categorySelected(0);
				expect(
					(transactionEditController.transaction as SplitTransaction)
						.subtransactions[0].transaction_type as SubtransactionType,
				).to.equal("Sub");
			});
		});

		it("should set the direction to outflow if the selected category is not an existing category", (): void => {
			transactionEditController.transaction.category = "new category";
			transactionEditController.categorySelected();
			expect(transactionEditController.transaction.direction).to.equal(
				"outflow",
			);
		});

		it("should clear the subcategory if it's parent no longer matches the selected category", (): void => {
			(transactionEditController.transaction as BasicTransaction).subcategory =
				createCategory({ parent_id: 2 });
			transactionEditController.categorySelected();
			expect(
				(transactionEditController.transaction as BasicTransaction).subcategory,
			).to.be.null;
		});

		it("should not attempt to clear the subcategory if there isn't one", (): void => {
			delete (transactionEditController.transaction as BasicTransaction)
				.subcategory;
			transactionEditController.categorySelected();
			expect(
				(transactionEditController.transaction as BasicTransaction).subcategory,
			).to.not.be.null;
		});
	});

	describe("investmentCategorySelected", (): void => {
		beforeEach(
			(): PsuedoCategory =>
				(transactionEditController.transaction.category = { id: "", name: "" }),
		);

		it("should do nothing if the selected category is not an existing category", (): void => {
			const transactionType: SecurityTransactionType = "SecurityTransfer",
				direction: TransactionDirection = "inflow";

			transactionEditController.transaction.category = "new category";
			transactionEditController.transaction.transaction_type = transactionType;
			transactionEditController.transaction.direction = direction;
			transactionEditController.investmentCategorySelected();
			expect(transactionEditController.transaction.transaction_type).to.equal(
				transactionType,
			);
			expect(transactionEditController.transaction.direction).to.equal(
				direction,
			);
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
					(
						transactionEditController.transaction.category as PsuedoCategory
					).id = scenario.id;
					transactionEditController.investmentCategorySelected();
					expect(
						transactionEditController.transaction.transaction_type,
					).to.equal(scenario.type);
					expect(transactionEditController.transaction.direction).to.equal(
						scenario.direction,
					);
				});
			},
		);

		it("should not set the transaction type or direction if the category is not recognised", (): void => {
			const transactionType: SecurityTransactionType = "SecurityTransfer",
				direction: TransactionDirection = "inflow";

			(transactionEditController.transaction.category as PsuedoCategory).id =
				"unknown";
			transactionEditController.transaction.transaction_type = transactionType;
			transactionEditController.transaction.direction = direction;
			transactionEditController.investmentCategorySelected();
			expect(transactionEditController.transaction.transaction_type).to.equal(
				transactionType,
			);
			expect(transactionEditController.transaction.direction).to.equal(
				direction,
			);
		});
	});

	describe("$watch subtransations", (): void => {
		beforeEach((): void => {
			transactionEditController.transaction.direction = "outflow";
			(
				transactionEditController.transaction as SplitTransaction
			).subtransactions = [
				createSubtransaction({ amount: 10, direction: "outflow" }),
				createSubtransaction({ amount: 5, direction: "inflow" }),
				{},
			];
			sinon.stub(transactionEditController, "memoFromSubtransactions");
		});

		it("should do nothing if there are no subtransactions", (): void => {
			delete (
				transactionEditController.transaction as Partial<SplitTransaction>
			).subtransactions;
			(transactionEditController as angular.IController).$scope.$digest();
			expect(transactionEditController.totalAllocated).to.be.null;
		});

		it("should calculate the total and make it available to the view", (): void => {
			(transactionEditController as angular.IController).$scope.$digest();
			expect(transactionEditController.totalAllocated as number).to.equal(5);
		});

		it("should not set the main transaction memo when editing an existing transaction", (): void => {
			(transactionEditController as angular.IController).$scope.$digest();
			expect(transactionEditController["memoFromSubtransactions"]).to.not.have
				.been.called;
		});

		it("should set the main transaction memos when adding a new transaction", (): void => {
			transactionEditController.transaction.id = null;
			(transactionEditController as angular.IController).$scope.$digest();
			expect(transactionEditController["memoFromSubtransactions"]).to.have.been
				.called;
		});
	});

	describe("memoFromSubtransactions", (): void => {
		beforeEach((): void => {
			const memo = "memo";

			transactionEditController.transaction.memo = memo;
			(
				transactionEditController.transaction as SplitTransaction
			).subtransactions = [
				createSubtransaction({ memo: "memo 1" }),
				createSubtransaction({ memo: "memo 2" }),
				{},
			];
		});

		it("should join the sub transaction memos and set the main transaction memo", (): void => {
			transactionEditController.memoFromSubtransactions();
			expect(transactionEditController.transaction.memo).to.equal(
				"memo 1; memo 2",
			);
		});
	});

	describe("accounts", (): void => {
		beforeEach(
			(): boolean =>
				delete (transactionEditController.transaction as Partial<Transaction>)
					.primary_account,
		);

		it("should fetch the list of accounts", (): void => {
			transactionEditController.accounts("a", 2);
			expect(accountModel.all).to.have.been.called;
		});

		it("should remove the current account from the list", async (): Promise<void> => {
			transactionEditController.transaction.primary_account = createAccount({
				name: "aa",
			});
			expect(await transactionEditController.accounts("a", 2)).to.deep.equal([
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" }),
			]);
		});

		it("should return a filtered & limited list of non-investment accounts when the transaction type is not Security Transfer", async (): Promise<Chai.Assertion> =>
			expect(await transactionEditController.accounts("b", 2)).to.deep.equal([
				createAccount({ id: 4, name: "ba", account_type: "asset" }),
				createAccount({ id: 5, name: "ab", account_type: "asset" }),
			]));

		it("should return a filtered & limited list of investment accounts when the transaction type is Security Transfer", async (): Promise<void> => {
			transactionEditController.transaction.transaction_type =
				"SecurityTransfer";
			expect(await transactionEditController.accounts("b", 2)).to.deep.equal([
				createAccount({ id: 2, name: "bb", account_type: "investment" }),
				createAccount({ id: 6, name: "bc", account_type: "investment" }),
			]);
		});
	});

	describe("primaryAccountSelected", (): void => {
		it("should do nothing when the transfer account is null", (): void => {
			(
				transactionEditController.transaction as TransferrableTransaction
			).account = null;
			transactionEditController.primaryAccountSelected();
			expect(
				(transactionEditController.transaction as TransferrableTransaction)
					.account,
			).to.be.null;
		});

		it("should do nothing when the transfer account is undefined", (): void => {
			transactionEditController.primaryAccountSelected();
			expect(transactionEditController.transaction).to.not.have.property(
				"account",
			);
		});

		it("should clear the transfer account when the primary account matches", (): void => {
			(
				transactionEditController.transaction as TransferrableTransaction
			).account = createAccount({ id: 1 });
			transactionEditController.transaction.primary_account = createAccount({
				id: 1,
			});
			transactionEditController.primaryAccountSelected();
			expect(
				(transactionEditController.transaction as TransferrableTransaction)
					.account,
			).to.be.null;
		});
	});

	describe("addSubtransaction", (): void => {
		it("should add an empty object to the subtransactions array", (): void => {
			(
				transactionEditController.transaction as SplitTransaction
			).subtransactions = [];
			transactionEditController.addSubtransaction();
			expect(
				(transactionEditController.transaction as SplitTransaction)
					.subtransactions,
			).to.deep.equal([{}]);
		});
	});

	describe("deleteSubtransaction", (): void => {
		it("should remove an item from the subtransactions array at the specified index", (): void => {
			(
				transactionEditController.transaction as SplitTransaction
			).subtransactions = [
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 2 }),
				createSubtransaction({ id: 3 }),
			];
			transactionEditController.deleteSubtransaction(1);
			expect(
				(transactionEditController.transaction as SplitTransaction)
					.subtransactions,
			).to.deep.equal([
				createSubtransaction({ id: 1 }),
				createSubtransaction({ id: 3 }),
			]);
		});
	});

	describe("addUnallocatedAmount", (): void => {
		beforeEach((): void => {
			(transactionEditController.transaction as SplitTransaction).amount = 100;
			transactionEditController.totalAllocated = 80;
			(
				transactionEditController.transaction as SplitTransaction
			).subtransactions = [
				createSubtransaction({ amount: 80 }),
				createSubtransaction({ amount: undefined }),
			];
		});

		it("should increase an existing subtransaction amount by the unallocated amount", (): void => {
			transactionEditController.addUnallocatedAmount(0);
			expect(
				(transactionEditController.transaction as SplitTransaction)
					.subtransactions[0].amount as number,
			).to.equal(100);
		});

		it("should set a blank subtransacion amount to the unallocated amount", (): void => {
			transactionEditController.addUnallocatedAmount(1);
			expect(
				(transactionEditController.transaction as SplitTransaction)
					.subtransactions[1].amount as number,
			).to.equal(20);
		});
	});

	describe("updateInvestmentDetails", (): void => {
		let amount: number, memo: string;

		beforeEach((): void => {
			amount = 100;
			memo = "memo";
			transactionEditController.transaction.id = null;
			transactionEditController.transaction.transaction_type =
				"SecurityInvestment";
			(
				transactionEditController.transaction as SecurityHoldingTransaction
			).quantity = 2;
			(
				transactionEditController.transaction as SecurityInvestmentTransaction
			).price = 10;
			(
				transactionEditController.transaction as SecurityInvestmentTransaction
			).commission = 1;
			(
				transactionEditController.transaction as SecurityInvestmentTransaction
			).amount = amount;
			transactionEditController.transaction.memo = memo;
		});

		it("should do nothing when the transaction type is not SecurityInvestment", (): void => {
			transactionEditController.transaction.transaction_type = "Basic";
			transactionEditController.updateInvestmentDetails();
			expect(
				(transactionEditController.transaction as BasicTransaction).amount,
			).to.equal(amount);
			expect(transactionEditController.transaction.memo).to.equal(memo);
		});

		it("should not update the memo when editing an existing Security Investment transaction", (): void => {
			transactionEditController.transaction.id = 1;
			transactionEditController.updateInvestmentDetails();
			expect(transactionEditController.transaction.memo).to.equal(memo);
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
					transactionEditController.transaction.direction = scenario.direction;
					delete (
						transactionEditController.transaction as Partial<SecurityInvestmentTransaction>
					).quantity;
					delete (
						transactionEditController.transaction as Partial<SecurityInvestmentTransaction>
					).price;
					delete (
						transactionEditController.transaction as Partial<SecurityInvestmentTransaction>
					).commission;
					transactionEditController.updateInvestmentDetails();
					expect(
						(
							transactionEditController.transaction as SecurityInvestmentTransaction
						).amount,
					).to.equal(0);
					expect(transactionEditController.transaction.memo).to.be.empty;
				});

				it(`should calculate the transaction amount from the price, quantity and commission for a Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
					transactionEditController.transaction.direction = scenario.direction;
					transactionEditController.updateInvestmentDetails();
					expect(
						(
							transactionEditController.transaction as SecurityInvestmentTransaction
						).amount,
					).to.equal(scenario.amount);
				});

				it(`should update the memo with the price, quantity and commission when adding a new Security Investment transaction when the direction is ${scenario.direction}`, (): void => {
					transactionEditController.transaction.direction = scenario.direction;
					transactionEditController.updateInvestmentDetails();
					expect(transactionEditController.transaction.memo).to.equal(
						`2.0000 @ $10.000 (${scenario.memo} $1.00 commission)`,
					);
				});
			},
		);
	});

	describe("invalidateCaches", (): void => {
		let original: Transaction,
			saved: Transaction,
			subtransaction: SplitTransactionChild;

		beforeEach((): void => {
			original = createBasicTransaction() as Transaction;
			(original as TransferrableTransaction).account = createAccount();
			(original as SecurityTransaction).security = createSecurity();

			subtransaction = createSubtransaction() as SplitTransactionChild;
			(subtransaction as SubtransferTransaction).account = createAccount();

			saved = angular.copy(original);

			transactionModel.findSubtransactions = sinon.stub().returns({
				then(callback: (subtransactions: SplitTransactionChild[]) => void): {
					catch: SinonStub;
				} {
					callback([subtransaction]);

					return {
						catch: sinon.stub(),
					};
				},
			});

			transactionEditController = controllerTest("TransactionEditController", {
				transaction: original,
			}) as TransactionEditController;
		});

		it("should do nothing if the original values are undefined", (): void => {
			transactionEditController = controllerTest("TransactionEditController", {
				transaction: {},
			}) as TransactionEditController;
			delete (saved as Partial<TransferrableTransaction>).account;
			delete (saved as Partial<BasicTransaction>).payee;
			delete (saved as Partial<BasicTransaction>).category;
			delete (saved as BasicTransaction).subcategory;
			delete (saved as Partial<SecurityTransaction>).security;
			delete (saved as Partial<SplitTransaction>).subtransactions;
			transactionEditController["invalidateCaches"](saved);
			expect(accountModel.flush).to.not.have.been.called;
			expect(payeeModel.flush).to.not.have.been.called;
			expect(categoryModel.flush).to.not.have.been.called;
			expect(securityModel.flush).to.not.have.been.called;
		});

		it("should do nothing if the original values are unchanged", (): void => {
			transactionEditController["invalidateCaches"](saved);
			expect(accountModel.flush).to.not.have.been.called;
			expect(payeeModel.flush).to.not.have.been.called;
			expect(categoryModel.flush).to.not.have.been.called;
			expect(securityModel.flush).to.not.have.been.called;
		});

		it("should invalidate the original primary account if changed", (): void => {
			saved.primary_account.id = 2;
			transactionEditController["invalidateCaches"](saved);
			expect(accountModel.flush).to.have.been.calledWith(
				original.primary_account.id,
			);
		});

		it("should invalidate the original payee if changed", (): void => {
			((saved as BasicTransaction).payee as Payee).id = 2;
			transactionEditController["invalidateCaches"](saved);
			expect(payeeModel.flush).to.have.been.calledWith(
				((original as BasicTransaction).payee as Payee).id,
			);
		});

		it("should invalidate the original category if changed", (): void => {
			((saved as BasicTransaction).category as Category).id = 2;
			transactionEditController["invalidateCaches"](saved);
			expect(categoryModel.flush).to.have.been.calledWith(
				((original as BasicTransaction).category as Category).id,
			);
		});

		it("should invalidate the original subcategory if changed", (): void => {
			((saved as BasicTransaction).subcategory as Category).id = 3;
			transactionEditController["invalidateCaches"](saved);
			expect(categoryModel.flush).to.have.been.calledWith(
				((original as BasicTransaction).subcategory as Category).id,
			);
		});

		it("should invalidate the original account if changed", (): void => {
			((saved as TransferrableTransaction).account as Account).id = 2;
			transactionEditController["invalidateCaches"](saved);
			expect(accountModel.flush).to.have.been.calledWith(
				((original as TransferrableTransaction).account as Account).id,
			);
		});

		it("should invalidate the original security if changed", (): void => {
			((saved as SecurityTransaction).security as Security).id = 2;
			transactionEditController["invalidateCaches"](saved);
			expect(securityModel.flush).to.have.been.calledWith(
				((original as SecurityTransaction).security as Security).id,
			);
		});

		const scenarios: SplitTransactionType[] = [
			"Split",
			"LoanRepayment",
			"Payslip",
		];

		scenarios.forEach((scenario: SplitTransactionType): void => {
			it(`should fetch the subtransactions when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(transactionModel.findSubtransactions).to.have.been.calledWith(
					original.id,
				);
			});

			it(`should do nothing if subtransaction values are undefined when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				delete subtransaction.category;
				delete (subtransaction as Subtransaction).subcategory;
				delete (subtransaction as Partial<SubtransferTransaction>).account;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(categoryModel.flush).to.not.have.been.called;
				expect(accountModel.flush).to.not.have.been.called;
			});

			it(`should do nothing if subtransaction ids are undefined when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				delete (subtransaction.category as Category).id;
				delete ((subtransaction as Subtransaction).subcategory as Category).id;
				delete (subtransaction as SubtransferTransaction).account.id;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(categoryModel.flush).to.not.have.been.called;
				expect(accountModel.flush).to.not.have.been.called;
			});

			it(`should invalidate the subtransaction category if defined when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(categoryModel.flush).to.have.been.calledWith(
					(subtransaction.category as Category).id,
				);
			});

			it(`should invalidate the subtransaction subcategory if defined when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(categoryModel.flush).to.have.been.calledWith(
					((subtransaction as Subtransaction).subcategory as Category).id,
				);
			});

			it(`should invalidate the subtransfer account if defined when the type is ${scenario}`, (): void => {
				original.transaction_type = scenario;
				transactionEditController = controllerTest(
					"TransactionEditController",
					{ transaction: original },
				) as TransactionEditController;
				transactionEditController["invalidateCaches"](saved);
				expect(accountModel.flush).to.have.been.calledWith(
					(subtransaction as SubtransferTransaction).account.id,
				);
			});
		});

		it("should resolve with the saved transaction", async (): Promise<Chai.Assertion> =>
			expect(
				await transactionEditController["invalidateCaches"](saved),
			).to.deep.equal(saved));
	});

	describe("updateLruCaches", (): void => {
		const transferScenarios: (
				| PayeeTransactionType
				| SecurityTransactionType
			)[] = ["Transfer", "SecurityTransfer", "SecurityInvestment", "Dividend"],
			splitScenarios: SplitTransactionType[] = [
				"Split",
				"LoanRepayment",
				"Payslip",
			];
		let data: Transaction, subtransaction: SplitTransactionChild;

		beforeEach((): void => {
			data = createBasicTransaction() as Transaction;
			(data as TransferrableTransaction).account = createAccount();
			(data as SecurityTransaction).security = createSecurity();
			subtransaction = createSubtransaction() as SplitTransactionChild;
			(subtransaction as SubtransferTransaction).account = createAccount();

			transactionModel.findSubtransactions = sinon.stub().returns({
				then(callback: (subtransactions: SplitTransactionChild[]) => void): {
					catch: SinonStub;
				} {
					callback([subtransaction]);

					return {
						catch: sinon.stub(),
					};
				},
			});
		});

		it("should add the primary account to the recent list", (): void => {
			transactionEditController["updateLruCaches"](data);
			expect(accountModel.addRecent).to.have.been.calledWith(
				data.primary_account,
			);
		});

		it("should add the payee to the recent list for a non-investment account", (): void => {
			transactionEditController["updateLruCaches"](data);
			expect(payeeModel.addRecent).to.have.been.calledWith(
				(data as BasicTransaction).payee,
			);
			expect(securityModel.addRecent).to.not.have.been.called;
		});

		it("should add the security to the recent list for an investment account", (): void => {
			data.primary_account = createAccount({ account_type: "investment" });
			transactionEditController["updateLruCaches"](data);
			expect(securityModel.addRecent).to.have.been.calledWith(
				(data as SecurityTransaction).security,
			);
			expect(payeeModel.addRecent).to.not.have.been.called;
		});

		it("should add the category to the recent list if the type is Basic", (): void => {
			transactionEditController["updateLruCaches"](data);
			expect(categoryModel.addRecent).to.have.been.calledWith(data.category);
		});

		it("should not try to add the subcategory to the recent list if the type is Basic but there is no subcategory", (): void => {
			delete (data as BasicTransaction).subcategory;
			transactionEditController["updateLruCaches"](data);
			expect(categoryModel.addRecent).to.have.been.calledOnce;
		});

		it("should add the subcategory to the recent list if the type is Basic", (): void => {
			transactionEditController["updateLruCaches"](data);
			expect(categoryModel.addRecent).to.have.been.calledTwice;
			expect(categoryModel.addRecent).to.have.been.calledWith(
				(data as BasicTransaction).subcategory,
			);
		});

		transferScenarios.forEach(
			(scenario: PayeeTransactionType | SecurityTransactionType): void => {
				it(`should add the account to the recent list if the type is ${scenario}`, (): void => {
					data.transaction_type = scenario;
					transactionEditController["updateLruCaches"](data);
					expect(accountModel.addRecent).to.have.been.calledWith(
						(data as TransferrableTransaction).account,
					);
				});
			},
		);

		splitScenarios.forEach((scenario: SplitTransactionType): void => {
			it(`should fetch the subtransactions when the type is ${scenario}`, (): void => {
				data.transaction_type = scenario;
				transactionEditController["updateLruCaches"](data);
				expect(transactionModel.findSubtransactions).to.have.been.calledWith(
					data.id,
				);
			});

			it(`should add the subtransaction account to the recent list for Subtranfers when the type is ${scenario}`, (): void => {
				data.transaction_type = scenario;
				subtransaction.transaction_type = "Subtransfer";
				transactionEditController["updateLruCaches"](data);
				expect(accountModel.addRecent).to.have.been.calledWith(
					(subtransaction as SubtransferTransaction).account,
				);
			});

			it(`should add the subtransaction category to the recent list for Subtransactions when the type is ${scenario}`, (): void => {
				data.transaction_type = scenario;
				transactionEditController["updateLruCaches"](data);
				expect(categoryModel.addRecent).to.have.been.calledWith(
					(subtransaction as Subtransaction).category,
				);
			});

			it(`should not try to add the subtransaction subcategory to the recent list for Subtransactions if there is no subcategory when the type is ${scenario}`, (): void => {
				data.transaction_type = scenario;
				delete (subtransaction as Subtransaction).subcategory;
				transactionEditController["updateLruCaches"](data);
				expect(categoryModel.addRecent).to.have.been.calledOnce;
			});

			it(`should add the subtransaction subcategory to the recent list for Subtransactions when the type is ${scenario}`, (): void => {
				data.transaction_type = scenario;
				transactionEditController["updateLruCaches"](data);
				expect(categoryModel.addRecent).to.have.been.calledWith(
					(subtransaction as Subtransaction).subcategory,
				);
			});
		});

		it("should do nothing for other transaction types", (): void => {
			data.transaction_type = "SecurityHolding";
			transactionEditController["updateLruCaches"](data);
			expect(accountModel.addRecent).to.have.been.calledOnce;
			expect(categoryModel.addRecent).to.not.have.been.called;
			expect(payeeModel.addRecent).to.have.been.calledOnce;
			expect(securityModel.addRecent).to.not.have.been.called;
			expect(transactionModel.findSubtransactions).to.not.have.been.called;
		});

		it("should resolve with the saved transaction", async (): Promise<Chai.Assertion> =>
			expect(
				await transactionEditController["updateLruCaches"](data),
			).to.deep.equal(data));
	});

	describe("save", (): void => {
		beforeEach((): void => {
			sinon.stub(
				transactionEditController,
				"invalidateCaches" as keyof TransactionEditController,
			);
			sinon.stub(
				transactionEditController,
				"updateLruCaches" as keyof TransactionEditController,
			);
		});

		it("should reset any previous error messages", (): void => {
			transactionEditController.errorMessage = "error message";
			transactionEditController.save();
			expect(transactionEditController.errorMessage as string | null).to.be
				.null;
		});

		it("should save the transaction", (): void => {
			transactionEditController.save();
			expect(transactionModel.save).to.have.been.calledWith(transaction);
		});

		it("should invalidate the $http caches", (): void => {
			transactionEditController.save();
			expect(
				transactionEditController["invalidateCaches"],
			).to.have.been.calledWith(transaction);
		});

		it("should update the LRU caches", (): void => {
			transactionEditController.save();
			expect(
				transactionEditController["updateLruCaches"],
			).to.have.been.calledWith(transaction);
		});

		it("should close the modal when the transaction save is successful", (): void => {
			transactionEditController.save();
			expect($uibModalInstance.close).to.have.been.calledWith(transaction);
		});

		it("should display an error message when the transaction save unsuccessful", (): void => {
			transactionEditController.transaction.id = -1;
			transactionEditController.save();
			expect(transactionEditController.errorMessage as string).to.equal(
				"unsuccessful",
			);
		});
	});

	describe("cancel", (): void => {
		it("should dismiss the modal", (): void => {
			transactionEditController.cancel();
			expect($uibModalInstance.dismiss).to.have.been.called;
		});
	});
});
