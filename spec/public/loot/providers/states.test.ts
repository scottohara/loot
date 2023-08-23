import type {
	Account,
	Accounts
} from "~/accounts/types";
import type {
	StateMock,
	UibModalMock
} from "~/mocks/node-modules/angular/types";
import type AccountModel from "~/accounts/models/account";
import type { AuthenticationModelMock } from "~/mocks/authentication/types";
import type { Category } from "~/categories/types";
import type CategoryModel from "~/categories/models/category";
import type { EntityModel } from "~/loot/types";
import type LootStatesProvider from "~/loot/providers/states";
import type MockDependenciesProvider from "~/mocks/loot/mockdependencies";
import type { Payee } from "~/payees/types";
import type PayeeModel from "~/payees/models/payee";
import type QueryService from "~/transactions/services/query";
import type { Schedule } from "~/schedules/types";
import type ScheduleModel from "~/schedules/models/schedule";
import type { Security } from "~/securities/types";
import type SecurityModel from "~/securities/models/security";
import type { TransactionBatch } from "~/transactions/types";
import type TransactionModel from "~/transactions/models/transaction";
import angular from "angular";
import sinon from "sinon";

describe("lootStatesProvider", (): void => {
	let	$rootScope: angular.IRootScopeService,
			$state: angular.ui.IStateService,
			$injector: angular.auto.IInjectorService,
			$httpBackend: angular.IHttpBackendService,
			$uibModal: UibModalMock,
			authenticationModel: AuthenticationModelMock,
			accountModel: AccountModel,
			accountsWithBalances: Accounts,
			account: Account,
			scheduleModel: ScheduleModel,
			schedules: Schedule[],
			payeeModel: PayeeModel,
			payees: Payee[],
			payee: Payee,
			categoryModel: CategoryModel,
			categories: Category[],
			category: Category,
			securityModel: SecurityModel,
			securities: Security[],
			security: Security,
			transactionModel: TransactionModel,
			transactionBatch: TransactionBatch,
			queryService: QueryService,
			stateName: string,
			stateParams: { id?: number; transactionId?: number; query?: string; },
			stateConfig: angular.ui.IState;

	// Load the modules
	beforeEach(angular.mock.module("lootStates", "lootMocks", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "authenticationModel", "authenticated", "accountModel", "accountsWithBalances", "account", "scheduleModel", "schedules", "payeeModel", "payees", "payee", "categoryModel", "categories", "category", "securityModel", "securities", "security", "transactionModel", "transactionBatch"])) as Mocha.HookFunction);

	// Inject the object under test and it's dependencies
	beforeEach(angular.mock.inject((_lootStates_: LootStatesProvider, _$rootScope_: angular.IRootScopeService, _$state_: angular.ui.IStateService, _$injector_: angular.auto.IInjectorService, _$httpBackend_: angular.IHttpBackendService, _$uibModal_: UibModalMock, _authenticationModel_: AuthenticationModelMock, _accountModel_: AccountModel, _accountsWithBalances_: Accounts, _account_: Account, _scheduleModel_: ScheduleModel, _schedules_: Schedule[], _payeeModel_: PayeeModel, _payees_: Payee[], _payee_: Payee, _categoryModel_: CategoryModel, _categories_: Category[], _category_: Category, _securityModel_: SecurityModel, _securities_: Security[], _security_: Security, _transactionModel_: TransactionModel, _transactionBatch_: TransactionBatch, _queryService_: QueryService): void => {
		$rootScope = _$rootScope_;
		$state = _$state_;
		$injector = _$injector_;
		$httpBackend = _$httpBackend_;
		$uibModal = _$uibModal_;
		authenticationModel = _authenticationModel_;
		accountModel = _accountModel_;
		accountsWithBalances = _accountsWithBalances_;
		account = _account_;
		scheduleModel = _scheduleModel_;
		schedules = _schedules_;
		payeeModel = _payeeModel_;
		payees = _payees_;
		payee = _payee_;
		categoryModel = _categoryModel_;
		categories = _categories_;
		category = _category_;
		securityModel = _securityModel_;
		securities = _securities_;
		security = _security_;
		transactionModel = _transactionModel_;
		transactionBatch = _transactionBatch_;
		queryService = _queryService_;
		$httpBackend.expectGET("loot/views/layout.html").respond(200);
	}) as Mocha.HookFunction);

	describe("root state", (): void => {
		let resolvedAuthenticated: Promise<boolean> | boolean;

		beforeEach((): void => {
			stateName = "root";
			stateConfig = $state.get(stateName);
		});

		it("should be abstract", (): Chai.Assertion => expect(stateConfig.abstract as boolean).to.be.true);

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Welcome"));

		it("should resolve the authentication status of a logged in user", (): void => {
			resolvedAuthenticated = $injector.invoke((stateConfig.resolve as { authenticated: () => boolean; }).authenticated);
			expect(resolvedAuthenticated).to.be.true;
		});

		describe("(non-logged in user)", (): void => {
			beforeEach((): void => {
				authenticationModel.isAuthenticated = false;
				$injector.invoke((stateConfig.resolve as { authenticated: () => Promise<boolean>; }).authenticated);
			});

			it("should show the login modal", (): Chai.Assertion => expect($uibModal.open).to.have.been.called);

			it("should resolve the authentication status of a logged in user when the login modal is closed", (): void => {
				authenticationModel.isAuthenticated = true;
				$uibModal.close();
				expect($uibModal.callbackResult as boolean).to.be.true;
			});

			it("should resolve the authentication status of a non-logged in user when the login modal is dismissed", (): void => {
				$uibModal.dismiss();
				expect($uibModal.callbackResult as boolean).to.be.false;
			});
		});
	});

	describe("accounts state", (): void => {
		beforeEach((): void => {
			stateName = "root.accounts";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("accounts/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Accounts"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName)).to.equal("#!/accounts"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedAccounts: Accounts | Promise<Accounts>;

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedAccounts = $injector.invoke(($state.current.resolve as { accounts: () => Accounts; }).accounts);
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the accounts", (): void => {
				expect(accountModel["allWithBalances"]).to.have.been.called;
				(resolvedAccounts as Promise<Accounts>).then((accounts: Accounts): Chai.Assertion => expect(accounts).to.deep.equal(accountsWithBalances));
			});

			describe("account state", (): void => {
				beforeEach((): void => {
					stateName += ".account";
					stateParams = { id: 1 };
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/accounts/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});

				describe("account transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Account Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/accounts/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, { reload: true });
						$rootScope.$digest();
						expect($state.current.name as string).to.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: AccountModel,
								resolvedContext: Account,
								resolvedTransactionBatch: Promise<TransactionBatch> | TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as { contextModel: () => AccountModel; }).contextModel);
							$injector.invoke(($state.current.resolve as { context: () => angular.IPromise<Account>; }).context, null, { contextModel: resolvedContextModel }).then((context: Account): Account => (resolvedContext = context));
							resolvedTransactionBatch = $injector.invoke(($state.current.resolve as { transactionBatch: () => TransactionBatch; }).transactionBatch, null, { contextModel: resolvedContextModel, context: resolvedContext });
						});

						it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => expect(resolvedContextModel).to.equal(accountModel));

						it("should resolve the parent context", (): void => {
							expect(accountModel["find"]).to.have.been.calledWith(1);
							expect(resolvedContext).to.deep.equal(account);
						});

						it("should resolve the transaction batch", (): void => {
							expect(resolvedContextModel["isUnreconciledOnly"]).to.have.been.calledWith(resolvedContext.id);
							expect(transactionModel["all"]).to.have.been.calledWith("/accounts/1", null, "prev", true);
							(resolvedTransactionBatch as Promise<TransactionBatch>).then((actualTransactionBatch: TransactionBatch): Chai.Assertion => expect(actualTransactionBatch).to.deep.equal(transactionBatch));
						});

						describe("account transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/accounts/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								expect($state.current.name as string).to.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("schedules state", (): void => {
		beforeEach((): void => {
			stateName = "root.schedules";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("schedules/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Schedules"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName)).to.equal("#!/schedules"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedSchedules: Schedule[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedSchedules = $injector.invoke(($state.current.resolve as { schedules: () => Schedule[]; }).schedules);
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the schedules", (): void => {
				expect(scheduleModel["all"]).to.have.been.called;
				expect(resolvedSchedules).to.deep.equal(schedules);
			});

			describe("schedule state", (): void => {
				beforeEach((): void => {
					stateName += ".schedule";
					stateParams = { id: 1 };
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/schedules/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});
			});
		});
	});

	describe("payees state", (): void => {
		beforeEach((): void => {
			stateName = "root.payees";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("payees/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Payees"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName)).to.equal("#!/payees"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedPayees: Payee[] | Promise<Payee[]>;

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedPayees = $injector.invoke(($state.current.resolve as { payees: () => Payee[]; }).payees);
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the payees", (): void => {
				expect(payeeModel["allList"]).to.have.been.called;
				(resolvedPayees as Promise<Payee[]>).then((actualPayees: Payee[]): Chai.Assertion => expect(actualPayees).to.deep.equal(payees));
			});

			describe("payee state", (): void => {
				beforeEach((): void => {
					stateName += ".payee";
					stateParams = { id: 1 };
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/payees/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});

				describe("payee transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Payee Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/payees/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, { reload: true });
						$rootScope.$digest();
						expect($state.current.name as string).to.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: PayeeModel,
								resolvedContext: angular.IPromise<Payee>,
								resolvedTransactionBatch: Promise<TransactionBatch> | TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as { contextModel: () => PayeeModel; }).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as { context: () => angular.IPromise<Payee>; }).context, null, { contextModel: resolvedContextModel });
							resolvedContext.then((context: Payee): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as { transactionBatch: () => TransactionBatch; }).transactionBatch, null, { contextModel: resolvedContextModel, context })));
						});

						it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => expect(resolvedContextModel).to.equal(payeeModel));

						it("should resolve the parent context", (): void => {
							expect(payeeModel["find"]).to.have.been.calledWith(1);
							resolvedContext.then((context: Payee): Chai.Assertion => expect(context).to.deep.equal(payee));
						});

						it("should resolve the transaction batch", (): void => {
							expect(transactionModel["all"]).to.have.been.calledWith("/payees/1", null, "prev", false);
							(resolvedTransactionBatch as Promise<TransactionBatch>).then((actualTransactionBatch: TransactionBatch): Chai.Assertion => expect(actualTransactionBatch).to.deep.equal(transactionBatch));
						});

						describe("payee transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/payees/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								expect($state.current.name as string).to.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("categories state", (): void => {
		beforeEach((): void => {
			stateName = "root.categories";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("categories/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Categories"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName)).to.equal("#!/categories"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedCategories: Category[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedCategories = $injector.invoke(($state.current.resolve as { categories: () => Category[]; }).categories);
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the categories", (): void => {
				expect(categoryModel["allWithChildren"]).to.have.been.called;
				expect(resolvedCategories).to.deep.equal(categories);
			});

			describe("category state", (): void => {
				beforeEach((): void => {
					stateName += ".category";
					stateParams = { id: 1 };
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/categories/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});

				describe("category transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Category Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/categories/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, { reload: true });
						$rootScope.$digest();
						expect($state.current.name as string).to.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: CategoryModel,
								resolvedContext: angular.IPromise<Category>,
								resolvedTransactionBatch: Promise<TransactionBatch> | TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as { contextModel: () => CategoryModel; }).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as { context: () => angular.IPromise<Category>; }).context, null, { contextModel: resolvedContextModel });
							resolvedContext.then((context: Category): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as { transactionBatch: () => TransactionBatch; }).transactionBatch, null, { contextModel: resolvedContextModel, context })));
						});

						it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => expect(resolvedContextModel).to.equal(categoryModel));

						it("should resolve the parent context", (): void => {
							expect(categoryModel["find"]).to.have.been.calledWith(1);
							resolvedContext.then((context: Category): Chai.Assertion => expect(context).to.deep.equal(category));
						});

						it("should resolve the transaction batch", (): void => {
							expect(transactionModel["all"]).to.have.been.calledWith("/categories/1", null, "prev", false);
							(resolvedTransactionBatch as Promise<TransactionBatch>).then((actualTransactionBatch: TransactionBatch): Chai.Assertion => expect(actualTransactionBatch).to.deep.equal(transactionBatch));
						});

						describe("category transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/categories/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								expect($state.current.name as string).to.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("securities state", (): void => {
		beforeEach((): void => {
			stateName = "root.securities";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("securities/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Securities"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName)).to.equal("#!/securities"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedSecurities: Security[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedSecurities = $injector.invoke(($state.current.resolve as { securities: () => Security[]; }).securities);
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the securities", (): void => {
				expect(securityModel["allWithBalances"]).to.have.been.called;
				expect(resolvedSecurities).to.deep.equal(securities);
			});

			describe("security state", (): void => {
				beforeEach((): void => {
					stateName += ".security";
					stateParams = { id: 1 };
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/securities/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});

				describe("security transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Security Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/securities/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, { reload: true });
						$rootScope.$digest();
						expect($state.current.name as string).to.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: SecurityModel,
								resolvedContext: angular.IPromise<Security>,
								resolvedTransactionBatch: Promise<TransactionBatch> | TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as { contextModel: () => SecurityModel; }).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as { context: () => angular.IPromise<Security>; }).context, null, { contextModel: resolvedContextModel });
							resolvedContext.then((context: Security): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as { transactionBatch: () => TransactionBatch; }).transactionBatch, null, { contextModel: resolvedContextModel, context })));
						});

						it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => expect(resolvedContextModel).to.equal(securityModel));

						it("should resolve the parent context", (): void => {
							expect(securityModel["find"]).to.have.been.calledWith(1);
							resolvedContext.then((context: Security): Chai.Assertion => expect(context).to.deep.equal(security));
						});

						it("should resolve the transaction batch", (): void => {
							expect(transactionModel["all"]).to.have.been.calledWith("/securities/1", null, "prev", false);
							(resolvedTransactionBatch as Promise<TransactionBatch>).then((actualTransactionBatch: TransactionBatch): Chai.Assertion => expect(actualTransactionBatch).to.deep.equal(transactionBatch));
						});

						describe("security transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal("#!/securities/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								expect($state.current.name as string).to.equal(stateName);
							});
						});
					});
				});
			});
		});
	});

	describe("transactions state", (): void => {
		let query: string;

		beforeEach((): void => {
			query = "search";
			stateName = "root.transactions";
			stateParams = { query };
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("transactions/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => expect(stateConfig.data.title).to.equal("Search Transactions"));

		it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal(`#!/transactions?query=${query}`));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName, stateParams);
			$rootScope.$digest();
			expect($state.current.name as string).to.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let	previousState: StateMock,
					resolvedPreviousState: angular.ui.IState,
					resolvedContext: string,
					resolvedTransactionBatch: Promise<TransactionBatch> | TransactionBatch;

			beforeEach((): void => {
				previousState = {
					current: {
						name: "previous state"
					},
					params: {},
					includes: sinon.stub().returns(false),
					currentState: sinon.stub(),
					reload: sinon.stub(),
					go: sinon.stub()
				};
				$state.go(stateName, stateParams);
				$rootScope.$digest();
				resolvedPreviousState = $injector.invoke(($state.current.resolve as { previousState: () => angular.ui.IState; }).previousState, null, { $state: previousState });
				resolvedContext = $injector.invoke(($state.current.resolve as { context: () => string; }).context);
				resolvedTransactionBatch = $injector.invoke(($state.current.resolve as { transactionBatch: () => TransactionBatch; }).transactionBatch, null, { context: resolvedContext });
				$injector.invoke($state.current.onEnter as () => void, null, { previousState: resolvedPreviousState });
			});

			it("should successfully transition", (): Chai.Assertion => expect($state.current.name as string).to.equal(stateName));

			it("should resolve the previous state", (): Chai.Assertion => expect(resolvedPreviousState).to.deep.equal({ name: (previousState.current as { name: string; }).name, params: previousState.params }));

			it("should not resolve the previous state if transitioning from a different query", (): void => {
				previousState.includes.withArgs("root.transactions").returns(true);
				resolvedPreviousState = $injector.invoke(($state.current.resolve as { previousState: () => angular.ui.IState; }).previousState, null, { $state: previousState });
				expect(resolvedPreviousState as angular.ui.IState | null).to.be.null;
			});

			it("should resolve the context model", (): Chai.Assertion => expect($injector.invoke(($state.current.resolve as { contextModel: () => EntityModel | null; }).contextModel)).to.be.null);

			it("should resolve the context", (): Chai.Assertion => expect(resolvedContext).to.equal(query));

			it("should resolve the transaction batch", (): void => {
				expect(transactionModel["query"]).to.have.been.calledWith(query, null, "prev");
				(resolvedTransactionBatch as Promise<TransactionBatch>).then((actualTransactionBatch: TransactionBatch): Chai.Assertion => expect(actualTransactionBatch).to.deep.equal(transactionBatch));
			});

			it("should set the previous state property on the query service on enter", (): Chai.Assertion => expect(queryService.previousState as angular.ui.IState).to.deep.equal(resolvedPreviousState));

			it("should not update the previous state property on the query service on enter if the previous state did not resolve", (): void => {
				$injector.invoke($state.current.onEnter as () => void, null, { previousState: null });
				expect(queryService.previousState as angular.ui.IState).to.deep.equal(resolvedPreviousState);
			});

			it("should set the query property on the query service on enter", (): Chai.Assertion => expect(queryService.query as string).to.equal(query));

			it("should clear the query property on the query service on exit", (): void => {
				$httpBackend.expectGET("accounts/views/index.html").respond(200);
				$state.go("root.accounts");
				$rootScope.$digest();
				expect(queryService.query).to.be.null;
			});

			describe("transaction state", (): void => {
				beforeEach((): void => {
					stateName += ".transaction";
					stateParams.transactionId = 2;
				});

				it("should resolve to a URL", (): Chai.Assertion => expect($state.href(stateName, stateParams)).to.equal(`#!/transactions/2?query=${query}`));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					expect($state.current.name as string).to.equal(stateName);
				});
			});
		});
	});
});
