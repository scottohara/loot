import {
	Account,
	Accounts
} from "accounts/types";
import {
	StateMock,
	UibModalMock
} from "mocks/node-modules/angular/types";
import AccountModel from "accounts/models/account";
import {AuthenticationModelMock} from "mocks/authentication/types";
import {Category} from "categories/types";
import CategoryModel from "categories/models/category";
import LootStatesProvider from "loot/providers/states";
import MockDependenciesProvider from "mocks/loot/mockdependencies";
import {Payee} from "payees/types";
import PayeeModel from "payees/models/payee";
import QueryService from "transactions/services/query";
import {Schedule} from "schedules/types";
import ScheduleModel from "schedules/models/schedule";
import {Security} from "securities/types";
import SecurityModel from "securities/models/security";
import {TransactionBatch} from "transactions/types";
import TransactionModel from "transactions/models/transaction";
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
			stateParams: {id?: number, transactionId?: number, query?: string},
			stateConfig: angular.ui.IState;

	// Load the modules
	beforeEach(angular.mock.module("lootStates", "lootMocks", (mockDependenciesProvider: MockDependenciesProvider): void => mockDependenciesProvider.load(["$uibModal", "authenticationModel", "authenticated", "accountModel", "accountsWithBalances", "account", "scheduleModel", "schedules", "payeeModel", "payees", "payee", "categoryModel", "categories", "category", "securityModel", "securities", "security", "transactionModel", "transactionBatch"])));

	// Inject the object under test and it's dependencies
	beforeEach(inject((_lootStates_: LootStatesProvider, _$rootScope_: angular.IRootScopeService, _$state_: angular.ui.IStateService, _$injector_: angular.auto.IInjectorService, _$httpBackend_: angular.IHttpBackendService, _$uibModal_: UibModalMock, _authenticationModel_: AuthenticationModelMock, _accountModel_: AccountModel, _accountsWithBalances_: Accounts, _account_: Account, _scheduleModel_: ScheduleModel, _schedules_: Schedule[], _payeeModel_: PayeeModel, _payees_: Payee[], _payee_: Payee, _categoryModel_: CategoryModel, _categories_: Category[], _category_: Category, _securityModel_: SecurityModel, _securities_: Security[], _security_: Security, _transactionModel_: TransactionModel, _transactionBatch_: TransactionBatch, _queryService_: QueryService): void => {
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
	}));

	describe("root state", (): void => {
		let resolvedAuthenticated: boolean;

		beforeEach((): void => {
			stateName = "root";
			stateConfig = $state.get(stateName);
		});

		it("should be abstract", (): Chai.Assertion => (stateConfig.abstract as boolean).should.be.true);

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Welcome"));

		it("should resolve the authentication status of a logged in user", (): void => {
			resolvedAuthenticated = $injector.invoke((stateConfig.resolve as {authenticated: () => boolean}).authenticated);
			resolvedAuthenticated.should.be.true;
		});

		describe("(non-logged in user)", (): void => {
			beforeEach((): void => {
				authenticationModel.isAuthenticated = false;
				resolvedAuthenticated = $injector.invoke((stateConfig.resolve as {authenticated: () => boolean}).authenticated);
			});

			it("should show the login modal", (): Chai.Assertion => $uibModal.open.should.have.been.called);

			it("should resolve the authentication status of a logged in user when the login modal is closed", (): void => {
				authenticationModel.isAuthenticated = true;
				$uibModal.close();
				resolvedAuthenticated.should.eventually.be.true;
			});

			it("should resolve the authentication status of a non-logged in user when the login modal is dismissed", (): void => {
				$uibModal.dismiss();
				resolvedAuthenticated.should.eventually.be.false;
			});
		});
	});

	describe("accounts state", (): void => {
		beforeEach((): void => {
			stateName = "root.accounts";
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("accounts/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Accounts"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName).should.equal("#!/accounts"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedAccounts: Accounts;

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedAccounts = $injector.invoke(($state.current.resolve as {accounts: () => Accounts}).accounts);
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the accounts", (): void => {
				accountModel.allWithBalances.should.have.been.called;
				resolvedAccounts.should.eventually.deep.equal(accountsWithBalances);
			});

			describe("account state", (): void => {
				beforeEach((): void => {
					stateName += ".account";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/accounts/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
				});

				describe("account transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Account Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/accounts/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, {reload: true});
						$rootScope.$digest();
						($state.current.name as string).should.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: AccountModel,
								resolvedContext: Account,
								resolvedTransactionBatch: TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as {contextModel: () => AccountModel}).contextModel);
							$injector.invoke(($state.current.resolve as {context: () => angular.IPromise<Account>}).context, null, {contextModel: resolvedContextModel}).then((context: Account): Account => (resolvedContext = context));
							resolvedTransactionBatch = $injector.invoke(($state.current.resolve as {transactionBatch: () => TransactionBatch}).transactionBatch, null, {contextModel: resolvedContextModel, context: resolvedContext});
						});

						it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => resolvedContextModel.should.equal(accountModel));

						it("should resolve the parent context", (): void => {
							accountModel.find.should.have.been.calledWith(1);
							resolvedContext.should.deep.equal(account);
						});

						it("should resolve the transaction batch", (): void => {
							resolvedContextModel.isUnreconciledOnly.should.have.been.calledWith(resolvedContext.id);
							transactionModel.all.should.have.been.calledWith("/accounts/1", null, "prev", true);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("account transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/accounts/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								($state.current.name as string).should.equal(stateName);
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

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Schedules"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName).should.equal("#!/schedules"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedSchedules: Schedule[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedSchedules = $injector.invoke(($state.current.resolve as {schedules: () => Schedule[]}).schedules);
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the schedules", (): void => {
				scheduleModel.all.should.have.been.called;
				resolvedSchedules.should.deep.equal(schedules);
			});

			describe("schedule state", (): void => {
				beforeEach((): void => {
					stateName += ".schedule";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/schedules/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
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

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Payees"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName).should.equal("#!/payees"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedPayees: Payee[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedPayees = $injector.invoke(($state.current.resolve as {payees: () => Payee[]}).payees);
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the payees", (): void => {
				payeeModel.allList.should.have.been.called;
				resolvedPayees.should.eventually.deep.equal(payees);
			});

			describe("payee state", (): void => {
				beforeEach((): void => {
					stateName += ".payee";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/payees/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
				});

				describe("payee transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Payee Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/payees/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, {reload: true});
						$rootScope.$digest();
						($state.current.name as string).should.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: PayeeModel,
								resolvedContext: angular.IPromise<Payee>,
								resolvedTransactionBatch: TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as {contextModel: () => PayeeModel}).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as {context: () => angular.IPromise<Payee>}).context, null, {contextModel: resolvedContextModel});
							resolvedContext.then((context: Payee): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as {transactionBatch: () => TransactionBatch}).transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => resolvedContextModel.should.equal(payeeModel));

						it("should resolve the parent context", (): void => {
							payeeModel.find.should.have.been.calledWith(1);
							resolvedContext.should.eventually.deep.equal(payee);
						});

						it("should resolve the transaction batch", (): void => {
							transactionModel.all.should.have.been.calledWith("/payees/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("payee transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/payees/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								($state.current.name as string).should.equal(stateName);
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

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Categories"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName).should.equal("#!/categories"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedCategories: Category[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedCategories = $injector.invoke(($state.current.resolve as {categories: () => Category[]}).categories);
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the categories", (): void => {
				categoryModel.allWithChildren.should.have.been.called;
				resolvedCategories.should.deep.equal(categories);
			});

			describe("category state", (): void => {
				beforeEach((): void => {
					stateName += ".category";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/categories/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
				});

				describe("category transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Category Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/categories/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, {reload: true});
						$rootScope.$digest();
						($state.current.name as string).should.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: CategoryModel,
								resolvedContext: angular.IPromise<Category>,
								resolvedTransactionBatch: TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as {contextModel: () => CategoryModel}).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as {context: () => angular.IPromise<Category>}).context, null, {contextModel: resolvedContextModel});
							resolvedContext.then((context: Category): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as {transactionBatch: () => TransactionBatch}).transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => resolvedContextModel.should.equal(categoryModel));

						it("should resolve the parent context", (): void => {
							categoryModel.find.should.have.been.calledWith(1);
							resolvedContext.should.eventually.deep.equal(category);
						});

						it("should resolve the transaction batch", (): void => {
							transactionModel.all.should.have.been.calledWith("/categories/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("category transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/categories/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								($state.current.name as string).should.equal(stateName);
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

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Securities"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName).should.equal("#!/securities"));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let resolvedSecurities: Security[];

			beforeEach((): void => {
				$state.go(stateName);
				$rootScope.$digest();
				resolvedSecurities = $injector.invoke(($state.current.resolve as {securities: () => Security[]}).securities);
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the securities", (): void => {
				securityModel.allWithBalances.should.have.been.called;
				resolvedSecurities.should.deep.equal(securities);
			});

			describe("security state", (): void => {
				beforeEach((): void => {
					stateName += ".security";
					stateParams = {id: 1};
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/securities/1"));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
				});

				describe("security transactions state", (): void => {
					beforeEach((): void => {
						stateName += ".transactions";
						stateConfig = $state.get(stateName);
						$httpBackend.expectGET("transactions/views/index.html").respond(200);
					});

					it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Security Transactions"));

					it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/securities/1/transactions"));

					it("should not transition if the user is unauthenticated", (): void => {
						authenticationModel.isAuthenticated = false;
						$state.go(stateName, stateParams, {reload: true});
						$rootScope.$digest();
						($state.current.name as string).should.not.equal(stateName);
					});

					describe("(on transition)", (): void => {
						let	resolvedContextModel: SecurityModel,
								resolvedContext: angular.IPromise<Security>,
								resolvedTransactionBatch: TransactionBatch;

						beforeEach((): void => {
							$state.go(stateName, stateParams);
							$rootScope.$digest();
							resolvedContextModel = $injector.invoke(($state.current.resolve as {contextModel: () => SecurityModel}).contextModel);
							resolvedContext = $injector.invoke(($state.current.resolve as {context: () => angular.IPromise<Security>}).context, null, {contextModel: resolvedContextModel});
							resolvedContext.then((context: Security): TransactionBatch => (resolvedTransactionBatch = $injector.invoke(($state.current.resolve as {transactionBatch: () => TransactionBatch}).transactionBatch, null, {contextModel: resolvedContextModel, context})));
						});

						it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

						it("should resolve the parent context's model", (): Chai.Assertion => resolvedContextModel.should.equal(securityModel));

						it("should resolve the parent context", (): void => {
							securityModel.find.should.have.been.calledWith(1);
							resolvedContext.should.eventually.deep.equal(security);
						});

						it("should resolve the transaction batch", (): void => {
							transactionModel.all.should.have.been.calledWith("/securities/1", null, "prev", false);
							resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
						});

						describe("security transaction state", (): void => {
							beforeEach((): void => {
								stateName += ".transaction";
								stateParams.transactionId = 2;
							});

							it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal("#!/securities/1/transactions/2"));

							it("should successfully transition", (): void => {
								$state.go(stateName, stateParams);
								$rootScope.$digest();
								($state.current.name as string).should.equal(stateName);
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
			stateParams = {query};
			stateConfig = $state.get(stateName);
			$httpBackend.expectGET("transactions/views/index.html").respond(200);
		});

		it("should have a title", (): Chai.Assertion => stateConfig.data.title.should.equal("Search Transactions"));

		it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal(`#!/transactions?query=${query}`));

		it("should not transition if the user is unauthenticated", (): void => {
			authenticationModel.isAuthenticated = false;
			$state.go(stateName, stateParams);
			$rootScope.$digest();
			($state.current.name as string).should.not.equal(stateName);
		});

		describe("(on transition)", (): void => {
			let	previousState: StateMock,
					resolvedPreviousState: angular.ui.IState,
					resolvedContext: string,
					resolvedTransactionBatch: TransactionBatch;

			beforeEach((): void => {
				previousState = {
					current: {
						name: "previous state"
					},
					params: {},
					includes: sinon.stub().returns(false),
					currentState(): void {},
					reload(): void {},
					go(): void {}
				};
				$state.go(stateName, stateParams);
				$rootScope.$digest();
				resolvedPreviousState = $injector.invoke(($state.current.resolve as {previousState: () => angular.ui.IState}).previousState, null, {$state: previousState});
				resolvedContext = $injector.invoke(($state.current.resolve as {context: () => string}).context);
				resolvedTransactionBatch = $injector.invoke(($state.current.resolve as {transactionBatch: () => TransactionBatch}).transactionBatch, null, {context: resolvedContext});
				$injector.invoke(($state.current.onEnter as Function), null, {previousState: resolvedPreviousState});
			});

			it("should successfully transition", (): Chai.Assertion => ($state.current.name as string).should.equal(stateName));

			it("should resolve the previous state", (): Chai.Assertion => resolvedPreviousState.should.deep.equal({name: (previousState.current as {name: string}).name, params: previousState.params}));

			it("should not resolve the previous state if transitioning from a different query", (): void => {
				previousState.includes.withArgs("root.transactions").returns(true);
				resolvedPreviousState = $injector.invoke(($state.current.resolve as {previousState: () => angular.ui.IState}).previousState, null, {$state: previousState});
				(!resolvedPreviousState).should.be.true;
			});

			it("should resolve the context model", (): Chai.Assertion => (null === $injector.invoke(($state.current.resolve as {contextModel: () => null}).contextModel)).should.be.true);

			it("should resolve the context", (): Chai.Assertion => resolvedContext.should.equal(query));

			it("should resolve the transaction batch", (): void => {
				transactionModel.query.should.have.been.calledWith(query, null, "prev");
				resolvedTransactionBatch.should.eventually.deep.equal(transactionBatch);
			});

			it("should set the previous state property on the query service on enter", (): Chai.Assertion => (queryService.previousState as angular.ui.IState).should.deep.equal(resolvedPreviousState));

			it("should not update the previous state property on the query service on enter if the previous state did not resolve", (): void => {
				$injector.invoke(($state.current.onEnter as Function), null, {previousState: null});
				(queryService.previousState as angular.ui.IState).should.deep.equal(resolvedPreviousState);
			});

			it("should set the query property on the query service on enter", (): Chai.Assertion => (queryService.query as string).should.equal(query));

			it("should clear the query property on the query service on exit", (): void => {
				$httpBackend.expectGET("accounts/views/index.html").respond(200);
				$state.go("root.accounts");
				$rootScope.$digest();
				(!queryService.query).should.be.true;
			});

			describe("transaction state", (): void => {
				beforeEach((): void => {
					stateName += ".transaction";
					stateParams.transactionId = 2;
				});

				it("should resolve to a URL", (): Chai.Assertion => $state.href(stateName, stateParams).should.equal(`#!/transactions/2?query=${query}`));

				it("should successfully transition", (): void => {
					$state.go(stateName, stateParams);
					$rootScope.$digest();
					($state.current.name as string).should.equal(stateName);
				});
			});
		});
	});
});