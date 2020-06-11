import {
	Entity,
	EntityModel
} from "loot/types";
import AccountIndexView from "accounts/views/index.html";
import AccountModel from "accounts/models/account";
import { Accounts } from "accounts/types";
import AuthenticationEditView from "authentication/views/edit.html";
import AuthenticationModel from "authentication/models/authentication";
import { Category } from "categories/types";
import CategoryIndexView from "categories/views/index.html";
import CategoryModel from "categories/models/category";
import LootLayoutView from "loot/views/layout.html";
import { Payee } from "payees/types";
import PayeeIndexView from "payees/views/index.html";
import PayeeModel from "payees/models/payee";
import QueryService from "transactions/services/query";
import { Schedule } from "schedules/types";
import ScheduleIndexView from "schedules/views/index.html";
import ScheduleModel from "schedules/models/schedule";
import { Security } from "securities/types";
import SecurityIndexView from "securities/views/index.html";
import SecurityModel from "securities/models/security";
import { TransactionBatch } from "transactions/types";
import TransactionIndexView from "transactions/views/index.html";
import TransactionModel from "transactions/models/transaction";

export default class LootStatesProvider {
	public $get: () => LootStatesProvider;

	public constructor($stateProvider: angular.ui.IStateProvider) {
		const transactionViews: {[name: string]: angular.ui.IState;} = {
			"@root": {
				templateUrl: TransactionIndexView,
				controller: "TransactionIndexController",
				controllerAs: "vm"
			}
		};

		function basicState(): angular.ui.IState {
			return {
				url: "/:id"
			};
		}

		function transactionsState(parentContext: string): angular.ui.IState {
			return {
				url: "/transactions",
				data: {
					title: `${parentContext.charAt(0).toUpperCase() + parentContext.substring(1)} Transactions`
				},
				resolve: {
					contextModel: ["authenticated", `${parentContext}Model`, (authenticated: boolean, contextModel: EntityModel): EntityModel | false => authenticated && contextModel],
					context: ["authenticated", "$stateParams", "contextModel", (authenticated: boolean, $stateParams: angular.ui.IStateParamsService, contextModel: EntityModel): angular.IPromise<Entity> | false => authenticated && contextModel.find(Number($stateParams.id))],
					transactionBatch: ["authenticated", "transactionModel", "contextModel", "context", (authenticated: boolean, transactionModel: TransactionModel, contextModel: EntityModel, context: Entity): angular.IPromise<TransactionBatch> | false => {
						const unreconciledOnly: boolean = "function" === typeof (contextModel as AccountModel).isUnreconciledOnly && (contextModel as AccountModel).isUnreconciledOnly(Number(context.id));

						return authenticated && transactionModel.all(contextModel.path(context.id), null, "prev", unreconciledOnly);
					}]
				},
				views: transactionViews
			};
		}

		function transactionState(): angular.ui.IState {
			return {
				url: "/:transactionId"
			};
		}

		$stateProvider
			.state("root", {
				abstract: true,
				templateUrl: LootLayoutView,
				controller: "LayoutController",
				controllerAs: "vm",
				data: {
					title: "Welcome"
				},
				resolve: {
					authenticated: ["$uibModal", "authenticationModel",	($uibModal: angular.ui.bootstrap.IModalService, authenticationModel: AuthenticationModel): angular.IPromise<boolean> | boolean => {
						// Check if the user is authenticated
						if (!authenticationModel.isAuthenticated) {
							// Not authenticated, show the login modal
							return $uibModal.open({
								templateUrl: AuthenticationEditView,
								controller: "AuthenticationEditController",
								controllerAs: "vm",
								backdrop: "static",
								size: "sm"
							}).result.then((): boolean => authenticationModel.isAuthenticated).catch((): false => false);
						}

						// User is authenticated
						return true;
					}]
				}
			})
			.state("root.accounts", {
				url: "/accounts",
				templateUrl: AccountIndexView,
				controller: "AccountIndexController",
				controllerAs: "vm",
				data: {
					title: "Accounts"
				},
				resolve: {
					accounts: ["authenticated", "accountModel", (authenticated: boolean, accountModel: AccountModel): angular.IPromise<Accounts> | false => authenticated && accountModel.allWithBalances()]
				}
			})
			.state("root.accounts.account", basicState())
			.state("root.accounts.account.transactions", transactionsState("account"))
			.state("root.accounts.account.transactions.transaction", transactionState())
			.state("root.schedules", {
				url: "/schedules",
				templateUrl: ScheduleIndexView,
				controller: "ScheduleIndexController",
				controllerAs: "vm",
				data: {
					title: "Schedules"
				},
				resolve: {
					schedules: ["authenticated", "scheduleModel", (authenticated: boolean, scheduleModel: ScheduleModel): angular.IPromise<Schedule[]> | false => authenticated && scheduleModel.all()]
				}
			})
			.state("root.schedules.schedule", basicState())
			.state("root.payees", {
				url: "/payees",
				templateUrl: PayeeIndexView,
				controller: "PayeeIndexController",
				controllerAs: "vm",
				data: {
					title: "Payees"
				},
				resolve: {
					payees: ["authenticated", "payeeModel", (authenticated: boolean, payeeModel: PayeeModel): angular.IPromise<Payee[]> | false => authenticated && payeeModel.allList()]
				}
			})
			.state("root.payees.payee", basicState())
			.state("root.payees.payee.transactions", transactionsState("payee"))
			.state("root.payees.payee.transactions.transaction", transactionState())
			.state("root.categories", {
				url: "/categories",
				templateUrl: CategoryIndexView,
				controller: "CategoryIndexController",
				controllerAs: "vm",
				data: {
					title: "Categories"
				},
				resolve: {
					categories: ["authenticated", "categoryModel", (authenticated: boolean, categoryModel: CategoryModel): angular.IPromise<Category[]> | false => authenticated && categoryModel.allWithChildren()]
				}
			})
			.state("root.categories.category", basicState())
			.state("root.categories.category.transactions", transactionsState("category"))
			.state("root.categories.category.transactions.transaction", transactionState())
			.state("root.securities", {
				url: "/securities",
				templateUrl: SecurityIndexView,
				controller: "SecurityIndexController",
				controllerAs: "vm",
				data: {
					title: "Securities"
				},
				resolve: {
					securities: ["authenticated", "securityModel", (authenticated: boolean, securityModel: SecurityModel): angular.IPromise<Security[]> | false => authenticated && securityModel.allWithBalances()]
				}
			})
			.state("root.securities.security", basicState())
			.state("root.securities.security.transactions", transactionsState("security"))
			.state("root.securities.security.transactions.transaction", transactionState())
			.state("root.transactions", {
				url: "/transactions?query",
				data: {
					title: "Search Transactions"
				},
				resolve: {
					previousState: ["$state", ($state: angular.ui.IStateService): angular.ui.IState | null => {
						if (!$state.includes("root.transactions")) {
							return {
								name: $state.current.name,
								params: { ...$state.params }
							};
						}

						return null;
					}],
					contextModel: (): null => null,
					context: ["$stateParams", ($stateParams: angular.ui.IStateParamsService): string => String($stateParams.query)],
					transactionBatch: ["authenticated", "transactionModel", "context", (authenticated: boolean, transactionModel: TransactionModel, context: string): angular.IPromise<TransactionBatch> | false => authenticated && transactionModel.query(context, null, "prev")]
				},
				views: transactionViews,
				onEnter: ["$stateParams", "queryService", "previousState", ($stateParams: angular.ui.IStateParamsService, queryService: QueryService, previousState: angular.ui.IState | null): void => {
					queryService.previousState = null === previousState ? queryService.previousState : previousState;
					queryService.query = String($stateParams.query);
				}],
				onExit: ["queryService", (queryService: QueryService): void => {
					// Can't use concise function body because implicit return of 'false' causes route transition to cancel in ui-router@1.x
					queryService.query = null;
				}]
			})
			.state("root.transactions.transaction", transactionState());

		this.$get = (): LootStatesProvider => this;
	}
}

LootStatesProvider.$inject = ["$stateProvider"];