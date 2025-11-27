import type {
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
	TransferrableTransaction,
} from "~/transactions/types";
import type { ControllerTestFactory, EventMock } from "~/mocks/types";
import type { Entity, EntityModel } from "~/loot/types";
import type {
	StateMock,
	UibModalMock,
	UibModalMockResolves,
} from "~/mocks/node-modules/angular/types";
import { addDays, startOfDay, subDays } from "date-fns";
import {
	createBasicTransaction,
	createSecurityHoldingTransaction,
	createSplitTransaction,
	createSubtransaction,
	createSubtransferTransaction,
	createTransferTransaction,
} from "~/mocks/transactions/factories";
import sinon, { type SinonStub } from "sinon";
import type { Account } from "~/accounts/types";
import type AccountModel from "~/accounts/models/account";
import type { Category } from "~/categories/types";
import type CategoryModel from "~/categories/models/category";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { OgModalConfirm } from "~/og-components/og-modal-confirm/types";
import type { OgTableActionHandlers } from "~/og-components/og-table-navigable/types";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import type OgViewScrollService from "~/og-components/og-view-scroll/services/og-view-scroll";
import type { Payee } from "~/payees/types";
import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import type TransactionIndexController from "~/transactions/controllers";
import type { TransactionModelMock } from "~/mocks/transactions/types";
import angular from "angular";
import createAccount from "~/mocks/accounts/factories";
import createCategory from "~/mocks/categories/factories";
import createPayee from "~/mocks/payees/factories";
import createSecurity from "~/mocks/securities/factories";

describe("TransactionIndexController", (): void => {
	let transactionIndexController: TransactionIndexController,
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
		context: Entity | string,
		transactionBatch: TransactionBatch,
		deregisterTransitionSuccessHook: SinonStub;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"lootTransactions",
			(mockDependenciesProvider: MockDependenciesProvider): void =>
				mockDependenciesProvider.load([
					"$uibModal",
					"$window",
					"$state",
					"transactionModel",
					"accountModel",
					"categoryModel",
					"securityModel",
					"contextModel",
					"context",
					"transactionBatch",
				]),
		) as Mocha.HookFunction,
	);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_controllerTest_: ControllerTestFactory,
				_$transitions_: angular.ui.IStateParamsService,
				_$uibModal_: UibModalMock,
				_$timeout_: angular.ITimeoutService,
				_$window_: angular.IWindowService,
				_$state_: StateMock,
				_transactionModel_: TransactionModelMock,
				_accountModel_: AccountModel,
				_categoryModel_: CategoryModel,
				_securityModel_: SecurityModel,
				_ogTableNavigableService_: OgTableNavigableService,
				_ogViewScrollService_: OgViewScrollService,
				_contextModel_: EntityModel,
				_context_: Entity,
				_transactionBatch_: TransactionBatch,
			): void => {
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
				sinon
					.stub($transitions, "onSuccess")
					.returns(deregisterTransitionSuccessHook);
				sinon.stub(ogViewScrollService, "scrollTo");
				transactionIndexController = controllerTest(
					"TransactionIndexController",
				) as TransactionIndexController;
			},
		) as Mocha.HookFunction,
	);

	it("should make the passed context available to the view", (): Chai.Assertion =>
		expect(transactionIndexController.context).to.deep.equal(context));

	it("should make the passed context type available to the view", (): Chai.Assertion =>
		expect(String(transactionIndexController.contextType)).to.equal(
			contextModel.type,
		));

	it("should not set a context type when a context model was not specified", (): void => {
		transactionIndexController = controllerTest("TransactionIndexController", {
			contextModel: null,
		}) as TransactionIndexController;
		expect(transactionIndexController.contextType).to.be.undefined;
	});

	it("should fetch the show all details setting", (): Chai.Assertion =>
		expect(transactionModel.allDetailsShown).to.have.been.called);

	it("should make today's date available to the view", (): Chai.Assertion =>
		expect(transactionIndexController.today).to.deep.equal(
			startOfDay(new Date()),
		));

	it("should set an empty array of transactions to the view", (): void => {
		transactionIndexController = controllerTest("TransactionIndexController", {
			transactionBatch: {
				transactions: { length: 0 } as Transaction[],
				openingBalance: 0,
				atEnd: false,
			},
		}) as TransactionIndexController;
		expect(transactionIndexController.transactions).to.be.an("array");
		expect(transactionIndexController.transactions).to.be.empty;
	});

	it("should process the passed transaction batch", (): number =>
		(transactionIndexController["openingBalance"] =
			transactionBatch.openingBalance));

	it("should ensure the transaction is focussed when the transaction id state param is present", (): void => {
		$state.params.transactionId = "1";
		transactionIndexController = controllerTest("TransactionIndexController", {
			$state,
		}) as TransactionIndexController;
		transactionIndexController.tableActions.focusRow = sinon.stub();
		$timeout.flush();
		expect(
			(transactionIndexController.tableActions as OgTableActionHandlers)
				.focusRow,
		).to.have.been.calledWith(0);
	});

	it("should set the previous/next loading indicators to false", (): void => {
		expect(transactionIndexController.loading.prev).to.be.false;
		expect(transactionIndexController.loading.next).to.be.false;
	});

	it("should register a success transition hook", (): Chai.Assertion =>
		expect($transitions.onSuccess).to.have.been.calledWith(
			{ to: "**.transactions.transaction" },
			sinon.match.func,
		));

	it("should deregister the success transition hook when the scope is destroyed", (): void => {
		(transactionIndexController as angular.IController).$scope.$emit(
			"$destroy",
		);
		expect(deregisterTransitionSuccessHook).to.have.been.called;
	});

	it("should ensure the transaction is focussed when the transaction id state param changes", (): void => {
		const toParams = { transactionId: "1" };

		sinon.stub(
			transactionIndexController,
			"transitionSuccessHandler" as keyof TransactionIndexController,
		);
		$transitions.onSuccess.firstCall.args[1]({
			params: sinon.stub().withArgs("to").returns(toParams),
		});
		expect(
			transactionIndexController["transitionSuccessHandler"],
		).to.have.been.calledWith(Number(toParams.transactionId));
	});

	it("should scroll to the bottom when the controller loads", (): void => {
		$timeout.flush();
		expect(ogViewScrollService["scrollTo"]).to.have.been.calledWith("bottom");
	});

	describe("editTransaction", (): void => {
		let transaction: Transaction, contextChangedStub: SinonStub;

		beforeEach((): void => {
			contextChangedStub = sinon.stub(
				transactionIndexController,
				"contextChanged" as keyof TransactionIndexController,
			);
			sinon.stub(
				transactionIndexController,
				"updateClosingBalance" as keyof TransactionIndexController,
			);
			sinon.stub(transactionIndexController, "getTransactions");
			sinon.stub(
				transactionIndexController,
				"updateRunningBalances" as keyof TransactionIndexController,
			);
			sinon.stub(
				transactionIndexController,
				"focusTransaction" as keyof TransactionIndexController,
			);
			transaction = angular.copy(transactionIndexController.transactions[1]);
		});

		it("should disable navigation on the table", (): void => {
			transactionIndexController["editTransaction"]();
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		describe("(edit existing)", (): void => {
			it("should do nothing if the transaction can't be edited", (): void => {
				sinon
					.stub(
						transactionIndexController,
						"isAllowed" as keyof TransactionIndexController,
					)
					.returns(false);
				transactionIndexController["editTransaction"](1);
				expect(ogTableNavigableService.enabled).to.be.true;
				expect($uibModal.open).to.not.have.been.called;
			});

			it("should open the edit transaction modal with a transaction", (): void => {
				transactionIndexController["editTransaction"](1);
				expect($uibModal.open).to.have.been.called;
				expect(
					($uibModal.resolves as UibModalMockResolves)
						.transaction as Transaction,
				).to.deep.equal(transaction);
				expect(transactionModel.findSubtransactions).to.not.have.been.called;
			});

			const scenarios: SplitTransactionType[] = [
				"Split",
				"LoanRepayment",
				"Payslip",
			];

			scenarios.forEach((scenario: SplitTransactionType): void => {
				it(`should prefetch the subtransactions for a ${scenario} transaction`, (): void => {
					transactionIndexController.transactions[1].transaction_type =
						scenario;
					transactionIndexController["editTransaction"](1);
					expect(transactionModel.findSubtransactions).to.have.been.calledWith(
						transaction.id,
					);
					(
						($uibModal.resolves as UibModalMockResolves)
							.transaction as angular.IPromise<Transaction>
					).then(
						(resolvedTransaction: Transaction): Chai.Assertion =>
							expect(resolvedTransaction).to.have.property("subtransactions"),
					);
				});
			});

			it("should update the closing balance when the modal is closed", (): void => {
				const originalTransaction: Transaction = angular.copy(transaction);

				transaction.memo = "edited transaction";
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				expect(
					transactionIndexController["updateClosingBalance"],
				).to.have.been.calledWith(originalTransaction, transaction);
			});

			it("should update the transaction in the list of transactions when the modal is closed", (): void => {
				transaction.memo = "edited transaction";
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				expect(transactionIndexController.transactions).to.include(transaction);
			});
		});

		describe("(add new)", (): void => {
			let newTransaction: Partial<BaseTransaction>;

			beforeEach((): void => {
				newTransaction = {
					transaction_type: "Basic",
					transaction_date: startOfDay(new Date()),
				} as Partial<BaseTransaction>;
			});

			describe("(default values)", (): void => {
				beforeEach((): void => {
					transactionModel.lastTransactionDate = subDays(
						startOfDay(new Date()),
						1,
					);
					(newTransaction as Transaction).transaction_date =
						transactionModel.lastTransactionDate;
				});

				describe("(context type is security)", (): void => {
					it("should open the edit transaction modal with a default security", (): void => {
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{
								contextModel: securityModel as EntityModel,
								context: createSecurity() as Entity,
							},
						) as TransactionIndexController;
						(newTransaction as SecurityTransaction).transaction_type =
							"SecurityHolding";
						(newTransaction as SecurityTransaction).security =
							transactionIndexController.context as Security;
					});
				});

				describe("(context type is not security)", (): void => {
					it("should open the edit transaction modal with a default primary account if the context type is account", (): void => {
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{
								contextModel: accountModel as EntityModel,
								context: createAccount() as Entity,
							},
						) as TransactionIndexController;
						(newTransaction as Transaction).primary_account =
							transactionIndexController.context as Account;
					});

					it("should open the edit transaction modal with a default payee if the context type is payee", (): Payee =>
						((newTransaction as PayeeCashTransaction).payee =
							transactionIndexController.context as Payee));

					it("should open the edit transaction modal with a default category if the context type is category and the context is a category", (): void => {
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{
								contextModel: categoryModel as EntityModel,
								context: createCategory() as Entity,
							},
						) as TransactionIndexController;
						(newTransaction as CategorisableTransaction).category =
							transactionIndexController.context as Category;
						(newTransaction as SubcategorisableTransaction).subcategory = null;
					});

					it("should open the edit transaction modal with a default category and subcategory if the context type is category and the context is a subcategory", (): void => {
						(newTransaction as CategorisableTransaction).category =
							createCategory();
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{
								contextModel: categoryModel as EntityModel,
								context: createCategory({
									parent: (newTransaction as CategorisableTransaction)
										.category as Category,
								}) as Entity,
							},
						) as TransactionIndexController;
						(newTransaction as SubcategorisableTransaction).subcategory =
							transactionIndexController.context as Category;
					});
				});

				describe("(context type is unknown)", (): void => {
					it("should not set any context", (): TransactionIndexController =>
						(transactionIndexController = controllerTest(
							"TransactionIndexController",
							{ contextModel: null },
						) as TransactionIndexController));
				});

				afterEach((): void => {
					transactionIndexController["editTransaction"]();
					expect($uibModal.open).to.have.been.called;
					expect(
						($uibModal.resolves as UibModalMockResolves)
							.transaction as Transaction,
					).to.deep.equal(newTransaction);
				});
			});

			it("should update the closing balance when the modal is closed", (): void => {
				transactionIndexController["editTransaction"]();
				$uibModal.close(newTransaction as Transaction);
				expect(
					transactionIndexController["updateClosingBalance"],
				).to.have.been.calledWith(undefined, newTransaction);
			});

			it("should add the new transaction to the list of transactions when the modal is closed", (): void => {
				(newTransaction as PayeeCashTransaction).payee = context as Payee;
				transactionIndexController["editTransaction"]();
				$uibModal.close(newTransaction as Transaction);
				expect(
					transactionIndexController.transactions.pop() as Transaction,
				).to.deep.equal(newTransaction);
			});
		});

		it("should check if the context has changed when the modal is closed", (): void => {
			transactionIndexController["editTransaction"](1);
			$uibModal.close(transaction);
			expect(
				transactionIndexController["contextChanged"],
			).to.have.been.calledWith(transaction);
		});

		describe("(on context changed)", (): void => {
			beforeEach((): void => {
				contextChangedStub.returns(true);
				sinon.stub(
					transactionIndexController,
					"removeTransaction" as keyof TransactionIndexController,
				);
				transactionIndexController["editTransaction"](1);
			});

			it("should remove the transaction from the list of transactions", (): void => {
				$uibModal.close(transaction);
				expect(
					transactionIndexController["removeTransaction"],
				).to.have.been.calledWith(1);
			});
		});

		describe("(transaction date is before the current batch", (): void => {
			it("should fetch a new transaction batch starting from the new transaction date", (): void => {
				transaction.transaction_date = subDays(
					transactionIndexController.firstTransactionDate,
					1,
				);
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				expect(
					transactionIndexController["getTransactions"],
				).to.have.been.calledWith(
					"next",
					subDays(transaction.transaction_date, 1),
					transaction.id,
				);
			});
		});

		describe("(transaction date is after the current batch", (): void => {
			beforeEach((): void => {
				transaction.transaction_date = addDays(
					transactionIndexController.lastTransactionDate,
					1,
				);
				transactionIndexController["editTransaction"](1);
			});

			it("should not fetch a new transaction batch if we're already at the end", (): void => {
				transactionIndexController["atEnd"] = true;
				$uibModal.close(transaction);
				expect(transactionIndexController["getTransactions"]).to.not.have.been
					.called;
			});

			it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", (): void => {
				transactionIndexController["atEnd"] = false;
				$uibModal.close(transaction);
				expect(
					transactionIndexController["getTransactions"],
				).to.have.been.calledWith(
					"prev",
					addDays(transaction.transaction_date as Date, 1),
					transaction.id,
				);
			});
		});

		describe("transaction date is within the current batch, or we're at the end", (): void => {
			it("should not fetch a new transaction batch when the modal is closed", (): void => {
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				expect(transactionIndexController["getTransactions"]).to.not.have.been
					.called;
			});

			it("should resort the transaction list when the modal is closed", (): void => {
				transaction.id = 999;
				transaction.transaction_date = subDays(startOfDay(new Date()), 1);
				transactionIndexController["editTransaction"](1);
				$uibModal.close(transaction);
				expect(
					transactionIndexController.transactions.pop() as Transaction,
				).to.deep.equal(transaction);
			});

			it("should recalculate the running balances when the modal is closed", (): void => {
				transactionIndexController["editTransaction"]();
				$uibModal.close(transaction);
				expect(transactionIndexController["updateRunningBalances"]).to.have.been
					.called;
			});

			it("should focus the transaction when the modal is closed", (): void => {
				transactionIndexController["editTransaction"]();
				$uibModal.close(transaction);
				expect(
					transactionIndexController["focusTransaction"],
				).to.have.been.calledWith(transaction.id);
			});
		});

		it("should not change the transactions list when the modal is dismissed", (): void => {
			const originalTransactions = angular.copy(
				transactionIndexController.transactions,
			);

			transactionIndexController["editTransaction"]();
			$uibModal.dismiss();
			expect(transactionIndexController.transactions).to.deep.equal(
				originalTransactions,
			);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			transactionIndexController["editTransaction"]();
			$uibModal.close(transaction);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			transactionIndexController["editTransaction"]();
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("contextChanged", (): void => {
		let transaction: Record<string, Entity> & Transaction;

		beforeEach(
			(): Transaction =>
				(transaction = angular.copy(
					transactionIndexController.transactions[1],
				) as Record<string, Entity> & Transaction),
		);

		describe("(search mode)", (): void => {
			beforeEach(
				(): TransactionIndexController =>
					(transactionIndexController = controllerTest(
						"TransactionIndexController",
						{ contextModel: null, context: "Search" },
					) as TransactionIndexController),
			);

			it("should return true when the transaction memo no longer contains the search query", (): void => {
				transaction.memo = "test memo";
				expect(transactionIndexController["contextChanged"](transaction)).to.be
					.true;
			});

			it("should return false when the transaction memo contains the search query", (): void => {
				transaction.memo = "test search";
				expect(transactionIndexController["contextChanged"](transaction)).to.be
					.false;
			});
		});

		describe("(context mode)", (): void => {
			const scenarios: {
				type: "account" | "category" | "payee" | "security";
				field: keyof BasicTransaction | keyof SecurityTransaction;
				contextFactory: () => Entity;
			}[] = [
				{
					type: "account",
					field: "primary_account",
					contextFactory: createAccount,
				},
				{ type: "payee", field: "payee", contextFactory: createPayee },
				{ type: "security", field: "security", contextFactory: createSecurity },
				{ type: "category", field: "category", contextFactory: createCategory },
				{
					type: "category",
					field: "subcategory",
					contextFactory: (): Entity =>
						createCategory({ parent: createCategory() }),
				},
			];
			let contextModels: Record<string, EntityModel>;

			beforeEach((): void => {
				contextModels = {
					account: accountModel,
					payee: contextModel,
					security: securityModel,
					category: categoryModel,
				};
			});

			angular.forEach(
				scenarios,
				(scenario: {
					type: "account" | "category" | "payee" | "security";
					field: string;
					contextFactory: () => Entity;
				}): void => {
					it(`should return true when the context type is ${scenario.type} and the transaction ${scenario.field} no longer matches the context`, (): void => {
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{
								contextModel: contextModels[scenario.type],
								context: scenario.contextFactory(),
							},
						) as TransactionIndexController;
						transaction[scenario.field] = scenario.contextFactory();
						expect(transactionIndexController["contextChanged"](transaction)).to
							.be.true;
					});

					it(`should return false when the context type is ${scenario.type} and the transaction ${scenario.field} matches the context`, (): void => {
						context = scenario.contextFactory();
						transactionIndexController = controllerTest(
							"TransactionIndexController",
							{ contextModel: contextModels[scenario.type], context },
						) as TransactionIndexController;
						transaction[scenario.field] = context;
						expect(transactionIndexController["contextChanged"](transaction)).to
							.be.false;
					});
				},
			);

			it("should return false when the transaction field is undefined", (): void => {
				transactionIndexController = controllerTest(
					"TransactionIndexController",
					{ contextModel: accountModel as EntityModel },
				) as TransactionIndexController;
				delete (transaction as Partial<Transaction>).primary_account;
				expect(transactionIndexController["contextChanged"](transaction)).to.be
					.false;
			});
		});
	});

	describe("deleteTransaction", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(
				transactionIndexController,
				"removeTransaction" as keyof TransactionIndexController,
			);
		});

		it("should do nothing if the transaction can't be deleted", (): void => {
			sinon
				.stub(
					transactionIndexController,
					"isAllowed" as keyof TransactionIndexController,
				)
				.returns(false);
			transactionIndexController["deleteTransaction"](1);
			expect(ogTableNavigableService.enabled).to.be.true;
			expect($uibModal.open).to.not.have.been.called;
		});

		it("should disable navigation on the table", (): void => {
			transactionIndexController["deleteTransaction"](1);
			expect(ogTableNavigableService.enabled).to.be.false;
		});

		it("should open the delete transaction modal with a transaction", (): void => {
			transactionIndexController["deleteTransaction"](1);
			expect($uibModal.open).to.have.been.called;
			expect(
				($uibModal.resolves as UibModalMockResolves).transaction as Transaction,
			).to.deep.equal(transaction);
		});

		it("should remove the transaction from the transactions list when the modal is closed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.close(transaction);
			expect(
				transactionIndexController["removeTransaction"],
			).to.have.been.calledWith(1);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.close(transaction);
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dimissed", (): void => {
			transactionIndexController["deleteTransaction"](1);
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("removeTransaction", (): void => {
		let transaction: Transaction;

		beforeEach((): void => {
			transaction = angular.copy(transactionIndexController.transactions[1]);
			sinon.stub(
				transactionIndexController,
				"updateClosingBalance" as keyof TransactionIndexController,
			);
		});

		it("should update the closing balance if the transaction was not focussed", (): void => {
			transactionIndexController["removeTransaction"](1);
			expect(
				transactionIndexController["updateClosingBalance"],
			).to.have.been.calledWith(transaction);
		});

		it("should remove the transaction from the transactions list", (): void => {
			transactionIndexController["removeTransaction"](1);
			expect(transactionIndexController.transactions).to.not.include(
				transaction,
			);
		});

		it("should transition to the parent state if the transaction was focussed", (): void => {
			$state.currentState("**.transaction");
			transactionIndexController["removeTransaction"](1);
			expect($state.go).to.have.been.calledWith("^");
		});
	});

	describe("updateClosingBalance", (): void => {
		it("should do nothing if the context doesn't have a closing balance property", (): void => {
			context = "";
			transactionIndexController = controllerTest(
				"TransactionIndexController",
				{ context },
			) as TransactionIndexController;
			transactionIndexController["updateClosingBalance"](
				createBasicTransaction({ amount: 1 }),
			);
			expect(transactionIndexController).to.not.have.property(
				"closing_balance",
			);
		});

		describe("(context has a closing balance property)", (): void => {
			let transaction: Transaction | undefined, expected: number;

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

				afterEach((): void =>
					transactionIndexController["updateClosingBalance"](
						transaction as Transaction,
					),
				);
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

				afterEach((): void =>
					transactionIndexController["updateClosingBalance"](
						createBasicTransaction(),
						transaction as Transaction,
					),
				);
			});

			afterEach(
				(): Chai.Assertion =>
					expect(
						(transactionIndexController.context as Account).closing_balance,
					).to.equal(expected),
			);
		});
	});

	describe("isAllowed", (): void => {
		let transaction: SplitTransactionChild | Transaction;

		beforeEach((): void => {
			sinon.stub(
				transactionIndexController,
				"promptToSwitchAccounts" as keyof TransactionIndexController,
			);
			transaction = angular.copy(transactionIndexController.transactions[1]);
			transaction.primary_account = createAccount();
		});

		describe("(not allowed)", (): void => {
			const scenarios: {
				action: "delete" | "edit";
				type: TransactionType;
				message: string;
			}[] = [
				{
					action: "edit",
					type: "Sub",
					message:
						"This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?",
				},
				{
					action: "delete",
					type: "Sub",
					message:
						"This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?",
				},
				{
					action: "edit",
					type: "Subtransfer",
					message:
						"This transaction is part of a split transaction. You can only edit it from the parent account. Would you like to switch to the parent account now?",
				},
				{
					action: "delete",
					type: "Subtransfer",
					message:
						"This transaction is part of a split transaction. You can only delete it from the parent account. Would you like to switch to the parent account now?",
				},
				{
					action: "edit",
					type: "Dividend",
					message:
						"This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?",
				},
				{
					action: "edit",
					type: "SecurityInvestment",
					message:
						"This is an investment transaction. You can only edit it from the investment account. Would you like to switch to the investment account now?",
				},
			];

			angular.forEach(
				scenarios,
				(scenario: {
					action: "delete" | "edit";
					type: TransactionType;
					message: string;
				}): void => {
					it(`should prompt to switch accounts when attempting to ${scenario.action} a ${scenario.type} transaction`, (): void => {
						transaction.transaction_type = scenario.type;
						transactionIndexController["isAllowed"](
							scenario.action,
							transaction,
						);
						expect(
							transactionIndexController["promptToSwitchAccounts"],
						).to.have.been.calledWith(scenario.message, transaction);
					});

					it(`should return false when attempting to ${scenario.action} a ${scenario.type} transaction`, (): void => {
						transaction.transaction_type = scenario.type;
						expect(
							transactionIndexController["isAllowed"](
								scenario.action,
								transaction,
							),
						).to.be.false;
					});
				},
			);
		});

		describe("(allowed)", (): void => {
			const scenarios: {
				action: "delete" | "edit";
				type: TransactionType;
				account_type?: "investment";
			}[] = [
				{ action: "edit", type: "Basic" },
				{ action: "delete", type: "Basic" },
				{ action: "edit", type: "Dividend", account_type: "investment" },
				{ action: "delete", type: "Dividend" },
				{
					action: "edit",
					type: "SecurityInvestment",
					account_type: "investment",
				},
				{ action: "delete", type: "SecurityInvestment" },
			];

			angular.forEach(
				scenarios,
				(scenario: {
					action: "delete" | "edit";
					type: TransactionType;
					account_type?: "investment";
				}): void => {
					it(`should not prompt to switch accounts when attempting to ${
						scenario.action
					} a ${scenario.type} transaction${
						undefined === scenario.account_type
							? ""
							: ` from an ${scenario.account_type} acount`
					}`, (): void => {
						transaction.transaction_type = scenario.type;
						(transaction.primary_account as Account).account_type =
							scenario.account_type ??
							(transaction.primary_account as Account).account_type;
						transactionIndexController["isAllowed"](
							scenario.action,
							transaction,
						);
						expect(transactionIndexController["promptToSwitchAccounts"]).to.not
							.have.been.called;
					});

					it(`should return true when attempting to ${scenario.action} a ${
						scenario.type
					} transaction${
						undefined === scenario.account_type
							? ""
							: ` from an ${scenario.account_type} acount`
					}`, (): void => {
						transaction.transaction_type = scenario.type;
						(transaction.primary_account as Account).account_type =
							scenario.account_type ??
							(transaction.primary_account as Account).account_type;
						expect(
							transactionIndexController["isAllowed"](
								scenario.action,
								transaction,
							),
						).to.be.true;
					});
				},
			);
		});
	});

	describe("promptToSwitchAccounts", (): void => {
		let message: string, transaction: Transaction;

		beforeEach((): void => {
			sinon.stub(transactionIndexController, "switchAccount");
			sinon.stub(transactionIndexController, "switchPrimaryAccount");
			message = "test message";
			transaction = angular.copy(transactionIndexController.transactions[1]);
			(transaction as TransferrableTransaction).account = createAccount();
			transaction.primary_account = createAccount();
			transactionIndexController["promptToSwitchAccounts"](
				message,
				transaction,
			);
		});

		it("should disable navigation on the table", (): Chai.Assertion =>
			expect(ogTableNavigableService.enabled).to.be.false);

		it("should prompt the user to switch to the other account", (): void => {
			expect($uibModal.open).to.have.been.called;
			expect(
				(($uibModal.resolves as UibModalMockResolves).confirm as OgModalConfirm)
					.message,
			).to.equal(message);
		});

		it("should switch to the other account when the modal is closed", (): void => {
			$uibModal.close();
			expect(
				transactionIndexController["switchAccount"],
			).to.have.been.calledWith(null, transaction);
		});

		it("should switch to the primary account if there is no other account when the modal is closed", (): void => {
			(transaction as TransferrableTransaction).account = null;
			$uibModal.close();
			expect(
				transactionIndexController["switchPrimaryAccount"],
			).to.have.been.calledWith(null, transaction);
		});

		it("should enable navigation on the table when the modal is closed", (): void => {
			$uibModal.close();
			expect(ogTableNavigableService.enabled).to.be.true;
		});

		it("should enable navigation on the table when the modal is dismissed", (): void => {
			$uibModal.dismiss();
			expect(ogTableNavigableService.enabled).to.be.true;
		});
	});

	describe("tableActions.selectAction", (): void => {
		describe("(not reconciling)", (): void => {
			it("should edit a transaction", (): void => {
				sinon.stub(
					transactionIndexController,
					"editTransaction" as keyof TransactionIndexController,
				);
				transactionIndexController.tableActions.selectAction(1);
				expect(
					transactionIndexController["editTransaction"],
				).to.have.been.calledWith(1);
			});
		});

		describe("(reconciling)", (): void => {
			beforeEach((): void => {
				transactionIndexController = controllerTest(
					"TransactionIndexController",
					{ contextModel: accountModel },
				) as TransactionIndexController;
				transactionIndexController.reconciling = true;
				sinon.stub(transactionIndexController, "toggleCleared");
			});

			it("should set the transaction status to Cleared if not already", (): void => {
				transactionIndexController.transactions[1].status = "";
				transactionIndexController.tableActions.selectAction(1);
				expect(transactionIndexController.transactions[1].status).to.equal(
					"Cleared",
				);
			});

			it("should clear the transaction status if set to Cleared", (): void => {
				transactionIndexController.transactions[1].status = "Cleared";
				transactionIndexController.tableActions.selectAction(1);
				expect(transactionIndexController.transactions[1].status).to.equal("");
			});

			it("should toggle the transaction's cleared status", (): void => {
				transactionIndexController.tableActions.selectAction(1);
				expect(
					transactionIndexController["toggleCleared"],
				).to.have.been.calledWith(transactionIndexController.transactions[1]);
			});
		});
	});

	describe("tableActions.editAction", (): void => {
		it("should edit the transaction", (): void => {
			sinon.stub(
				transactionIndexController,
				"editTransaction" as keyof TransactionIndexController,
			);
			transactionIndexController.tableActions.editAction(1);
			expect(
				transactionIndexController["editTransaction"],
			).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.insertAction", (): void => {
		it("should insert a transaction", (): void => {
			sinon.stub(
				transactionIndexController,
				"editTransaction" as keyof TransactionIndexController,
			);
			transactionIndexController.tableActions.insertAction();
			expect(
				transactionIndexController["editTransaction"],
			).to.have.been.calledWithExactly();
		});
	});

	describe("tableActions.deleteAction", (): void => {
		it("should delete a transaction", (): void => {
			sinon.stub(
				transactionIndexController,
				"deleteTransaction" as keyof TransactionIndexController,
			);
			transactionIndexController.tableActions.deleteAction(1);
			expect(
				transactionIndexController["deleteTransaction"],
			).to.have.been.calledWithExactly(1);
		});
	});

	describe("tableActions.focusAction", (): void => {
		it("should focus a transaction when no transaction is currently focussed", (): void => {
			transactionIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith(".transaction", {
				transactionId: 2,
			});
		});

		it("should focus a transaction when another transaction is currently focussed", (): void => {
			$state.currentState("**.transaction");
			transactionIndexController.tableActions.focusAction(1);
			expect($state.go).to.have.been.calledWith("^.transaction", {
				transactionId: 2,
			});
		});
	});

	describe("getTransactions", (): void => {
		let fromDate: Date;

		beforeEach((): void => {
			sinon.stub(
				transactionIndexController,
				"processTransactions" as keyof TransactionIndexController,
			);
			fromDate = new Date();
		});

		it("should show a loading indicator in the specified direction", (): void => {
			(transactionIndexController.context as Entity).id = -1;
			transactionIndexController.getTransactions("next");
			expect(transactionIndexController.loading.next).to.be.true;
		});

		it("should fetch transactions before the first transaction date when going backwards", (): void => {
			const firstTransactionDate: Date = transactionIndexController
				.transactions[0].transaction_date as Date;

			transactionIndexController.getTransactions("prev");
			expect(transactionModel.all).to.have.been.calledWith(
				"/payees/1",
				firstTransactionDate,
				"prev",
			);
		});

		it("should fetch transactions after the last transaction date when going forwards", (): void => {
			const lastTransactionDate: Date = transactionIndexController.transactions[
				transactionIndexController.transactions.length - 1
			].transaction_date as Date;

			transactionIndexController.getTransactions("next");
			expect(transactionModel.all).to.have.been.calledWith(
				"/payees/1",
				lastTransactionDate,
				"next",
			);
		});

		it("should fetch transactions without a from date in either direction if there are no transactions", (): void => {
			transactionIndexController.transactions = [];
			transactionIndexController.getTransactions("prev");
			expect(transactionModel.all).to.have.been.calledWith("/payees/1");
		});

		it("should fetch transactions from a specified transaction date in either direction", (): void => {
			transactionIndexController.getTransactions("prev", fromDate);
			expect(transactionModel.all).to.have.been.calledWith(
				"/payees/1",
				fromDate,
			);
		});

		it("should search for transactions from a specified date in either direction", (): void => {
			transactionIndexController = controllerTest(
				"TransactionIndexController",
				{ contextModel: null, context: "search" },
			) as TransactionIndexController;
			transactionIndexController.getTransactions("prev", fromDate);
			expect(transactionModel.query).to.have.been.calledWith(
				"search",
				fromDate,
			);
		});

		it("should process the fetched transactions", (): void => {
			transactionIndexController.getTransactions("prev", fromDate, 1);
			expect(
				transactionIndexController["processTransactions"],
			).to.have.been.calledWith(transactionBatch, fromDate, 1);
		});

		it("should hide the loading indicator after fetching the transacactions", (): void => {
			transactionIndexController.getTransactions("prev");
			expect(transactionIndexController.loading.prev).to.be.false;
		});
	});

	describe("processTransactions", (): void => {
		beforeEach((): void => {
			transactionIndexController["openingBalance"] = 0;
			transactionIndexController.transactions = [];
			transactionIndexController["atEnd"] = false;
			sinon.stub(
				transactionIndexController,
				"updateRunningBalances" as keyof TransactionIndexController,
			);
			sinon.stub(
				transactionIndexController,
				"focusTransaction" as keyof TransactionIndexController,
			);
		});

		it("should do nothing if no transactions to process", (): void => {
			transactionBatch.transactions = [];
			transactionIndexController["processTransactions"](transactionBatch);
			expect(transactionIndexController["openingBalance"]).to.equal(0);
		});

		it("should make the opening balance of the batch available to the view", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController["openingBalance"] =
				transactionBatch.openingBalance;
		});

		it("should make the transactions available to the view", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			transactionIndexController.transactions = transactionBatch.transactions;
		});

		it("should set a flag if we've reached the end", (): void => {
			transactionIndexController["processTransactions"](
				transactionBatch,
				new Date(),
			);
			expect(transactionIndexController["atEnd"]).to.be.true;
		});

		it("should set a flag if a from date was not specified", (): void => {
			transactionBatch.atEnd = false;
			transactionIndexController["processTransactions"](transactionBatch);
			expect(transactionIndexController["atEnd"]).to.be.true;
		});

		it("should make the first transaction date available to the view", (): void => {
			const firstTransactionDate: Date = transactionBatch.transactions[0]
				.transaction_date as Date;

			transactionIndexController["processTransactions"](transactionBatch);
			expect(transactionIndexController.firstTransactionDate).to.equal(
				firstTransactionDate,
			);
		});

		it("should make the last transaction date available to the view", (): void => {
			const lastTransactionDate: Date = transactionBatch.transactions[
				transactionBatch.transactions.length - 1
			].transaction_date as Date;

			transactionIndexController["processTransactions"](transactionBatch);
			expect(transactionIndexController.lastTransactionDate).to.equal(
				lastTransactionDate,
			);
		});

		it("should calculate the running balances", (): void => {
			transactionIndexController["processTransactions"](transactionBatch);
			expect(transactionIndexController["updateRunningBalances"]).to.have.been
				.called;
		});

		it("should focus the transaction row for a specified transaction", (): void => {
			transactionIndexController["processTransactions"](
				transactionBatch,
				undefined,
				1,
			);
			expect(
				transactionIndexController["focusTransaction"],
			).to.have.been.calledWith(1);
		});
	});

	describe("updateRunningBalances", (): void => {
		it("should do nothing for investment accounts", (): void => {
			(transactionIndexController.context as Account).account_type =
				"investment";
			transactionIndexController["updateRunningBalances"]();
			expect(transactionIndexController.transactions).to.deep.equal(
				transactionBatch.transactions,
			);
		});

		it("should calculate a running balance on each transaction", (): void => {
			transactionIndexController["updateRunningBalances"]();
			expect(
				(transactionIndexController.transactions.pop() as Transaction).balance,
			).to.equal(95);
		});
	});

	describe("focusTransaction", (): void => {
		beforeEach(
			(): SinonStub =>
				(transactionIndexController.tableActions.focusRow = sinon.stub()),
		);

		it("should do nothing when the specific transaction row could not be found", (): void => {
			expect(transactionIndexController["focusTransaction"](999)).to.be.NaN;
			expect(
				(transactionIndexController.tableActions as OgTableActionHandlers)
					.focusRow,
			).to.not.have.been.called;
		});

		it("should focus the transaction row for the specified transaction", (): void => {
			const targetIndex: number =
				transactionIndexController["focusTransaction"](1);

			$timeout.flush();
			expect(
				(transactionIndexController.tableActions as OgTableActionHandlers)
					.focusRow,
			).to.have.been.calledWith(targetIndex);
		});

		it("should return the index of the specified transaction", (): void => {
			const targetIndex: number =
				transactionIndexController["focusTransaction"](1);

			expect(targetIndex).to.equal(0);
		});
	});

	describe("toggleShowAllDetails", (): void => {
		it("should update the show all details setting", (): void => {
			transactionIndexController.toggleShowAllDetails(true);
			expect(transactionModel.showAllDetails).to.have.been.calledWith(true);
		});

		it("should set a flag to indicate that we're showing all details", (): void => {
			transactionIndexController.showAllDetails = false;
			transactionIndexController.toggleShowAllDetails(true);
			expect(transactionIndexController.showAllDetails).to.be.true;
		});
	});

	describe("(account context)", (): void => {
		beforeEach(
			(): TransactionIndexController =>
				(transactionIndexController = controllerTest(
					"TransactionIndexController",
					{ contextModel: accountModel },
				) as TransactionIndexController),
		);

		it("should set a flag to enable reconciling", (): Chai.Assertion =>
			expect(transactionIndexController.reconcilable).to.be.true);

		it("should fetch the unreconciled only setting for the current account", (): Chai.Assertion =>
			expect(accountModel["isUnreconciledOnly"]).to.have.been.calledWith(
				(transactionIndexController.context as Entity).id,
			));

		describe("toggleUnreconciledOnly", (): void => {
			let direction: TransactionFetchDirection | null,
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
				expect(accountModel["unreconciledOnly"]).to.not.have.been.called;
			});

			it("should update the unreconciled only setting for the current account", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				expect(accountModel["unreconciledOnly"]).to.have.been.calledWith(
					(transactionIndexController.context as Entity).id,
					true,
				);
			});

			it("should set a flag to indicate that we're showing unreconciled transactions only", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				expect(transactionIndexController.unreconciledOnly).to.be.true;
			});

			it("should clear the list of transactions", (): void => {
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				expect(transactionIndexController.transactions).to.be.empty;
			});

			it("should refetch a batch of transactions in the specified direction", (): void => {
				transactionIndexController.toggleUnreconciledOnly(
					true,
					direction as TransactionFetchDirection,
					fromDate,
					transactionIdToFocus,
				);
				expect(
					transactionIndexController["getTransactions"],
				).to.have.been.calledWith(direction, fromDate, transactionIdToFocus);
			});

			it("should refetch a batch of transactions in the previous direction if a direction is not specified", (): void => {
				direction = null;
				transactionIndexController.toggleUnreconciledOnly(true, "prev");
				expect(
					transactionIndexController["getTransactions"],
				).to.have.been.calledWith("prev");
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

			it("should update all cleared transactions to reconciled", (): Chai.Assertion =>
				expect(accountModel["reconcile"]).to.have.been.calledWith(contextId));

			it("should cleared the account's closing balance", (): Chai.Assertion =>
				expect($window.localStorage["removeItem"]).to.have.been.calledWith(
					"lootClosingBalance-1",
				));

			it("should exit reconcile mode", (): Chai.Assertion =>
				expect(transactionIndexController.reconciling).to.be.false);

			it("should clear the list of transactions", (): void => {
				expect(transactionIndexController.transactions).to.be.an("array");
				expect(transactionIndexController.transactions).to.be.empty;
			});

			it("should refresh the list of transactions", (): Chai.Assertion =>
				expect(
					transactionIndexController["getTransactions"],
				).to.have.been.calledWith("prev"));
		});

		describe("cancel", (): void => {
			it("should exit reconcile mode", (): void => {
				transactionIndexController.reconciling = true;
				transactionIndexController.cancel();
				expect(transactionIndexController.reconciling).to.be.false;
			});
		});

		describe("reconcile", (): void => {
			it("should do nothing if we're currently reconciling", (): void => {
				transactionIndexController.reconciling = true;
				transactionIndexController.reconcile();
				expect($uibModal.open).to.not.have.been.called;
			});

			describe("(not already reconciling)", (): void => {
				beforeEach((): void => {
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.reconciling = false;
					transactionIndexController.reconcile();
				});

				it("should disable navigation on the table", (): Chai.Assertion =>
					expect(ogTableNavigableService.enabled).to.be.false);

				it("should prompt the user for the accounts closing balance", (): void => {
					expect($uibModal.open).to.have.been.called;
					expect(
						($uibModal.resolves as UibModalMockResolves).account as Account,
					).to.deep.equal(transactionIndexController.context);
				});

				it("should make the closing balance available to the view when the modal is closed", (): void => {
					const closingBalance = 100;

					$uibModal.close(closingBalance);
					expect(transactionIndexController["closingBalance"]).to.equal(
						closingBalance,
					);
				});

				it("should set the reconcile target to the difference between the reconciled closing balance and closing balance", (): void => {
					const closingBalance = 100.009;

					$uibModal.close(closingBalance);
					expect(transactionIndexController.reconcileTarget).to.equal(85.01);
				});

				it("should set the cleared total to the cleared closing balance", (): void => {
					$uibModal.close();
					expect(transactionIndexController.clearedTotal).to.equal(1.01);
				});

				it("should set the uncleared total to the difference between cleared closing balance and the reconcile target", (): void => {
					const closingBalance = 100.009;

					$uibModal.close(closingBalance);
					expect(transactionIndexController.unclearedTotal).to.equal(84);
				});

				it("should refetch the list of unreconciled transactions when the modal is closed", (): void => {
					$uibModal.close();
					expect(
						transactionIndexController["toggleUnreconciledOnly"],
					).to.have.been.calledWith(true);
				});

				it("should enter reconcile mode when the modal is closed", (): void => {
					$uibModal.close();
					expect(transactionIndexController.reconciling).to.be.true;
				});

				it("should enable navigation on the table when the modal is closed", (): void => {
					$uibModal.close();
					expect(ogTableNavigableService.enabled).to.be.true;
				});

				it("should enable navigation on the table when the modal is dismissed", (): void => {
					$uibModal.dismiss();
					expect(ogTableNavigableService.enabled).to.be.true;
				});
			});
		});

		describe("updateReconciledTotals", (): void => {
			let transaction: Transaction;

			beforeEach((): void => {
				transaction = createBasicTransaction({ amount: 1.02 });
				transactionIndexController["clearedTotal"] = 100.03;
			});

			describe("(clearing an inflow transaction", (): void => {
				it("should increase the cleared total by the amount of the transaction", (): void => {
					transaction.status = "Cleared";
					transaction.direction = "inflow";
					transactionIndexController["updateReconciledTotals"](transaction);
					expect(transactionIndexController.clearedTotal).to.equal(101.05);
				});
			});

			describe("(clearing an outflow transaction", (): void => {
				it("should decrease the cleared total by the amount of the transaction", (): void => {
					transaction.status = "Cleared";
					transaction.direction = "outflow";
					transactionIndexController["updateReconciledTotals"](transaction);
					expect(transactionIndexController.clearedTotal).to.equal(99.01);
				});
			});

			describe("(unclearing an inflow transaction", (): void => {
				it("should decrease the cleared total by the amount of the transaction", (): void => {
					transaction.status = "";
					transaction.direction = "inflow";
					transactionIndexController["updateReconciledTotals"](transaction);
					expect(transactionIndexController.clearedTotal).to.equal(99.01);
				});
			});

			describe("(unclearing an outflow transaction", (): void => {
				it("should increase the cleared total by the amount of the transaction", (): void => {
					transaction.status = "";
					transaction.direction = "outflow";
					transactionIndexController["updateReconciledTotals"](transaction);
					expect(transactionIndexController.clearedTotal).to.equal(101.05);
				});
			});

			it("should set the uncleared total to the difference between the cleared total and the reconcile target", (): void => {
				transactionIndexController["reconcileTarget"] = 200.01;
				transaction.status = "Cleared";
				transaction.direction = "inflow";
				transactionIndexController["updateReconciledTotals"](transaction);
				expect(transactionIndexController.unclearedTotal).to.equal(98.96);
			});
		});

		describe("toggleCleared", (): void => {
			let transaction: Transaction;

			beforeEach((): void => {
				transaction = createBasicTransaction();
				sinon.stub(
					transactionIndexController,
					"updateReconciledTotals" as keyof TransactionIndexController,
				);
				transactionIndexController.toggleCleared(transaction);
			});

			it("should update the transaction status", (): Chai.Assertion =>
				expect(transactionModel.updateStatus).to.have.been.calledWith(
					"/accounts/1",
					transaction.id,
					transaction.status,
				));

			it("should update the reconciled totals", (): Chai.Assertion =>
				expect(
					transactionIndexController["updateReconciledTotals"],
				).to.have.been.calledWith(transaction));
		});
	});

	describe("toggleSubtransactions", (): void => {
		let transaction: SplitTransaction;

		beforeEach(
			(): SplitTransaction =>
				(transaction = createSplitTransaction({
					id: -1,
					showSubtransactions: true,
				})),
		);

		it("should toggle a flag on the transaction indicating whether subtransactions are shown", (): void => {
			transactionIndexController.toggleSubtransactions(transaction);
			expect(transaction.showSubtransactions).to.be.false;
		});

		it("should do nothing if we're not showing subtransactions", (): void => {
			transactionIndexController.toggleSubtransactions(transaction);
			expect(transactionModel.findSubtransactions).to.not.have.been.called;
		});

		describe("(on shown)", (): void => {
			beforeEach((): void => {
				transaction.showSubtransactions = false;
				transaction.loadingSubtransactions = false;
				transaction.subtransactions = [createSubtransaction({ id: 1 })];
			});

			it("should show a loading indicator", (): void => {
				transactionIndexController.toggleSubtransactions(transaction);
				expect(transaction.showSubtransactions).to.be.true;
				expect(transaction.loadingSubtransactions).to.be.true;
			});

			it("should clear the subtransactions for the transaction", (): void => {
				transactionIndexController.toggleSubtransactions(transaction);
				expect(transaction.subtransactions).to.be.an("array");
				expect(transaction.subtransactions).to.be.empty;
			});

			it("should fetch the subtransactions", (): void => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(transaction);
				expect(transactionModel.findSubtransactions).to.have.been.calledWith(
					transaction.id,
				);
			});

			it("should update the transaction with it's subtransactions", (): void => {
				const subtransactions = [
					createSubtransferTransaction({ id: 1 }),
					createSubtransaction({ id: 2 }),
					createSubtransaction({ id: 3 }),
				];

				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(transaction);
				expect(transaction.subtransactions).to.deep.equal(subtransactions);
			});

			it("should hide the loading indicator", (): void => {
				transaction.id = 1;
				transactionIndexController.toggleSubtransactions(transaction);
				expect(transaction.loadingSubtransactions).to.be.false;
			});
		});
	});

	describe("switchTo", (): void => {
		let transaction: SplitTransactionChild,
			stateParams: { id: number; transactionId?: number | null },
			$event: EventMock;

		beforeEach((): void => {
			transaction = createSubtransferTransaction({ id: 2, parent_id: 1 });

			stateParams = {
				id: 3,
				transactionId: transaction.id,
			};

			$event = { stopPropagation: sinon.stub() };
		});

		it("should transition to the specified state passing the transaction id", (): void => {
			transaction.parent_id = null;
			transactionIndexController["switchTo"](
				null,
				"state",
				stateParams.id,
				transaction,
			);
			expect($state.go).to.have.been.calledWith(
				"root.state.transactions.transaction",
				stateParams,
			);
		});

		it("should transition to the specified state passing the parent transaction id if present", (): void => {
			stateParams.transactionId = transaction.parent_id;
			transactionIndexController["switchTo"](
				null,
				"state",
				stateParams.id,
				transaction,
			);
			expect($state.go).to.have.been.calledWith(
				"root.state.transactions.transaction",
				stateParams,
			);
		});

		it("should transition to the specified state passing the transaction id for a Subtransaction", (): void => {
			transaction.transaction_type = "Sub";
			transactionIndexController["switchTo"](
				null,
				"state",
				stateParams.id,
				transaction,
			);
			expect($state.go).to.have.been.calledWith(
				"root.state.transactions.transaction",
				stateParams,
			);
		});

		it("should stop the event from propagating if present", (): void => {
			transactionIndexController["switchTo"](
				$event as Event,
				"state",
				stateParams.id,
				transaction,
			);
			expect($event.stopPropagation as SinonStub).to.have.been.called;
		});
	});

	describe("switchToAccount", (): void => {
		let id: number, transaction: Transaction;

		beforeEach((): void => {
			sinon.stub(
				transactionIndexController,
				"switchTo" as keyof TransactionIndexController,
			);
			id = 1;
			transaction = createBasicTransaction();
		});

		it("should not toggle the unreconciled only setting for the account if the transaction is not reconciled", (): void => {
			transactionIndexController["switchToAccount"](null, id, transaction);
			expect(accountModel["unreconciledOnly"]).to.not.have.been.called;
		});

		it("should toggle the unreconciled only setting for the account if the transaction is reconciled", (): void => {
			transaction.status = "Reconciled";
			transactionIndexController["switchToAccount"](null, id, transaction);
			expect(accountModel["unreconciledOnly"]).to.have.been.calledWith(
				id,
				false,
			);
		});

		it("should transition to the specified state", (): void => {
			const event: EventMock = {};

			transactionIndexController["switchToAccount"](
				event as Event,
				id,
				transaction,
			);
			expect(transactionIndexController["switchTo"]).to.have.been.calledWith(
				event,
				"accounts.account",
				id,
				transaction,
			);
		});
	});

	describe("switchAccount", (): void => {
		it("should switch to the other side of the transaction", (): void => {
			const event: EventMock = {},
				transaction: TransferTransaction = createTransferTransaction();

			sinon.stub(
				transactionIndexController,
				"switchToAccount" as keyof TransactionIndexController,
			);
			transactionIndexController["switchAccount"](event as Event, transaction);
			expect(
				transactionIndexController["switchToAccount"],
			).to.have.been.calledWith(
				event,
				(transaction.account as Account).id,
				transaction,
			);
		});
	});

	describe("switchPrimaryAccount", (): void => {
		it("should switch to the primary account of the transaction", (): void => {
			const event: EventMock = {},
				transaction: TransferTransaction = createTransferTransaction();

			sinon.stub(
				transactionIndexController,
				"switchToAccount" as keyof TransactionIndexController,
			);
			transactionIndexController.switchPrimaryAccount(
				event as Event,
				transaction,
			);
			expect(
				transactionIndexController["switchToAccount"],
			).to.have.been.calledWith(
				event,
				transaction.primary_account.id,
				transaction,
			);
		});
	});

	describe("switchPayee", (): void => {
		it("should switch to the payee of the transaction", (): void => {
			const event: EventMock = {},
				transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(
				transactionIndexController,
				"switchTo" as keyof TransactionIndexController,
			);
			transactionIndexController.switchPayee(event as Event, transaction);
			expect(transactionIndexController["switchTo"]).to.have.been.calledWith(
				event,
				"payees.payee",
				(transaction.payee as Payee).id,
				transaction,
			);
		});
	});

	describe("switchSecurity", (): void => {
		it("should switch to the security of the transaction", (): void => {
			const event: EventMock = {},
				transaction: SecurityHoldingTransaction =
					createSecurityHoldingTransaction();

			sinon.stub(
				transactionIndexController,
				"switchTo" as keyof TransactionIndexController,
			);
			transactionIndexController.switchSecurity(event as Event, transaction);
			expect(transactionIndexController["switchTo"]).to.have.been.calledWith(
				event,
				"securities.security",
				(transaction.security as Security).id,
				transaction,
			);
		});
	});

	describe("switchCategory", (): void => {
		it("should switch to the category of the transaction", (): void => {
			const event: EventMock = {},
				transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(
				transactionIndexController,
				"switchTo" as keyof TransactionIndexController,
			);
			transactionIndexController.switchCategory(event as Event, transaction);
			expect(transactionIndexController["switchTo"]).to.have.been.calledWith(
				event,
				"categories.category",
				(transaction.category as Category).id,
				transaction,
			);
		});
	});

	describe("switchSubcategory", (): void => {
		it("should switch to the subcategory of the transaction", (): void => {
			const event: EventMock = {},
				transaction: BasicTransaction = createBasicTransaction();

			sinon.stub(
				transactionIndexController,
				"switchTo" as keyof TransactionIndexController,
			);
			transactionIndexController.switchSubcategory(event as Event, transaction);
			expect(transactionIndexController["switchTo"]).to.have.been.calledWith(
				event,
				"categories.category",
				(transaction.subcategory as Category).id,
				transaction,
			);
		});
	});

	describe("transitionSuccessHandler", (): void => {
		let transactionId: number, focusTransactionStub: SinonStub;

		beforeEach(
			(): SinonStub =>
				(focusTransactionStub = sinon
					.stub(
						transactionIndexController,
						"focusTransaction" as keyof TransactionIndexController,
					)
					.returns(1)),
		);

		it("should ensure the transaction is focussed when the transaction id state param changes", (): void => {
			transactionId = 2;
			transactionIndexController["transitionSuccessHandler"](transactionId);
			expect(
				transactionIndexController["focusTransaction"],
			).to.have.been.calledWith(transactionId);
		});

		describe("(transaction not found)", (): void => {
			beforeEach((): void => {
				sinon.stub(transactionIndexController, "getTransactions");
				focusTransactionStub.withArgs(3).returns(NaN);
				transactionId = 3;
			});

			it("should fetch the transaction details", (): void => {
				transactionIndexController["transitionSuccessHandler"](transactionId);
				expect(transactionModel.find).to.have.been.calledWith(transactionId);
			});

			describe("(showing unreconciled only)", (): void => {
				it("should toggle to show all transactions", (): void => {
					const transactionDate: Date = subDays(startOfDay(new Date()), 1),
						direction: TransactionFetchDirection = "next";

					transactionIndexController = controllerTest(
						"TransactionIndexController",
						{ contextModel: accountModel },
					) as TransactionIndexController;
					sinon
						.stub(
							transactionIndexController,
							"focusTransaction" as keyof TransactionIndexController,
						)
						.returns(NaN);
					sinon.stub(transactionIndexController, "toggleUnreconciledOnly");
					transactionIndexController.unreconciledOnly = true;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					expect(
						transactionIndexController["toggleUnreconciledOnly"],
					).to.have.been.calledWith(
						false,
						direction,
						transactionDate,
						transactionId,
					);
				});
			});

			describe("(transaction date is before the current batch)", (): void => {
				it("should fetch a new transaction batch starting from the new transaction date", (): void => {
					const fromDate: Date = subDays(startOfDay(new Date()), 2);

					transactionIndexController.firstTransactionDate = startOfDay(
						new Date(),
					);
					transactionIndexController["transitionSuccessHandler"](transactionId);
					expect(
						transactionIndexController["getTransactions"],
					).to.have.been.calledWith("next", fromDate);
				});
			});

			describe("(transaction date is after the current batch)", (): void => {
				it("should fetch a new transaction batch ending at the transaction date if we're not already at the end", (): void => {
					const fromDate: Date = startOfDay(new Date());

					transactionIndexController.lastTransactionDate = subDays(
						startOfDay(new Date()),
						2,
					);
					transactionIndexController["atEnd"] = false;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					expect(
						transactionIndexController["getTransactions"],
					).to.have.been.calledWith("prev", fromDate);
				});

				it("should fetch a new transaction batch for the current transaction date if we're already at the end", (): void => {
					const fromDate: Date = subDays(startOfDay(new Date()), 1),
						direction: TransactionFetchDirection = "next";

					transactionIndexController.lastTransactionDate = subDays(
						startOfDay(new Date()),
						2,
					);
					transactionIndexController["atEnd"] = true;
					transactionIndexController["transitionSuccessHandler"](transactionId);
					expect(
						transactionIndexController["getTransactions"],
					).to.have.been.calledWith(direction, fromDate);
				});
			});
		});
	});
});
