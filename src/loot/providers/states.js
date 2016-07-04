{
	/**
	 * Implementation
	 */
	class LootStatesProvider {
		constructor($stateProvider) {
			const transactionViews = {
				"@root": {
					templateUrl: "transactions/views/index.html",
					controller: "TransactionIndexController",
					controllerAs: "vm"
				}
			};

			function basicState() {
				return {
					url: "/:id"
				};
			}

			function transactionsState(parentContext) {
				return {
					url: "/transactions",
					data: {
						title: `${parentContext.charAt(0).toUpperCase() + parentContext.substring(1)} Transactions`
					},
					resolve: {
						contextModel: ["authenticated", `${parentContext}Model`,
							(authenticated, contextModel) => (authenticated && contextModel) || null
						],
						context: ["authenticated", "$stateParams", "contextModel",
							(authenticated, $stateParams, contextModel) => (authenticated && contextModel.find($stateParams.id)) || null
						],
						transactionBatch: ["authenticated", "transactionModel", "contextModel", "context",
							(authenticated, transactionModel, contextModel, context) => {
								if (authenticated) {
									const unreconciledOnly = contextModel.isUnreconciledOnly ? contextModel.isUnreconciledOnly(context.id) : false;

									return transactionModel.all(contextModel.path(context.id), null, "prev", unreconciledOnly);
								}

								return null;
							}
						]
					},
					views: transactionViews
				};
			}

			function transactionState() {
				return {
					url: "/:transactionId"
				};
			}

			$stateProvider
				.state("root", {
					abstract: true,
					templateUrl: "loot/views/layout.html",
					controller: "LayoutController",
					controllerAs: "vm",
					data: {
						title: "Welcome"
					},
					resolve: {
						authenticated: ["$uibModal", "authenticationModel",
							($uibModal, authenticationModel) => {
								// Check if the user is authenticated
								if (!authenticationModel.isAuthenticated) {
									// Not authenticated, show the login modal
									return $uibModal.open({
										templateUrl: "authentication/views/edit.html",
										controller: "AuthenticationEditController",
										controllerAs: "vm",
										backdrop: "static",
										size: "sm"
									}).result.then(() => authenticationModel.isAuthenticated).catch(() => false);
								}

								// User is authenticated
								return true;
							}
						]
					}
				})
				.state("root.accounts", {
					url: "/accounts",
					templateUrl: "accounts/views/index.html",
					controller: "AccountIndexController",
					controllerAs: "vm",
					data: {
						title: "Accounts"
					},
					resolve: {
						accounts: ["authenticated", "accountModel",
							(authenticated, accountModel) => (authenticated && accountModel.allWithBalances()) || null
						]
					}
				})
				.state("root.accounts.account", basicState())
				.state("root.accounts.account.transactions", transactionsState("account"))
				.state("root.accounts.account.transactions.transaction", transactionState())
				.state("root.schedules", {
					url: "/schedules",
					templateUrl: "schedules/views/index.html",
					controller: "ScheduleIndexController",
					controllerAs: "vm",
					data: {
						title: "Schedules"
					},
					resolve: {
						schedules: ["authenticated", "scheduleModel",
							(authenticated, scheduleModel) => (authenticated && scheduleModel.all()) || null
						]
					}
				})
				.state("root.schedules.schedule", basicState())
				.state("root.payees", {
					url: "/payees",
					templateUrl: "payees/views/index.html",
					controller: "PayeeIndexController",
					controllerAs: "vm",
					data: {
						title: "Payees"
					},
					resolve: {
						payees: ["authenticated", "payeeModel",
							(authenticated, payeeModel) => (authenticated && payeeModel.allList()) || null
						]
					}
				})
				.state("root.payees.payee", basicState())
				.state("root.payees.payee.transactions", transactionsState("payee"))
				.state("root.payees.payee.transactions.transaction", transactionState())
				.state("root.categories", {
					url: "/categories",
					templateUrl: "categories/views/index.html",
					controller: "CategoryIndexController",
					controllerAs: "vm",
					data: {
						title: "Categories"
					},
					resolve: {
						categories: ["authenticated", "categoryModel",
							(authenticated, categoryModel) => (authenticated && categoryModel.allWithChildren()) || null
						]
					}
				})
				.state("root.categories.category", basicState())
				.state("root.categories.category.transactions", transactionsState("category"))
				.state("root.categories.category.transactions.transaction", transactionState())
				.state("root.securities", {
					url: "/securities",
					templateUrl: "securities/views/index.html",
					controller: "SecurityIndexController",
					controllerAs: "vm",
					data: {
						title: "Securities"
					},
					resolve: {
						securities: ["authenticated", "securityModel",
							(authenticated, securityModel) => (authenticated && securityModel.allWithBalances()) || null
						]
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
						previousState: ["$state",
							$state => {
								if (!$state.includes("root.transactions")) {
									return {
										name: $state.current.name,
										params: $state.params
									};
								}

								return null;
							}
						],
						contextModel: () => null,
						context: ["$stateParams",
							$stateParams => $stateParams.query
						],
						transactionBatch: ["authenticated", "transactionModel", "context",
							(authenticated, transactionModel, context) => (authenticated && transactionModel.query(context, null, "prev")) || null
						]
					},
					views: transactionViews,
					onEnter: ["$stateParams", "queryService", "previousState",
						($stateParams, queryService, previousState) => {
							queryService.previousState = previousState || queryService.previousState;
							queryService.query = $stateParams.query;
						}
					],
					onExit: ["queryService",
						queryService => (queryService.query = null)
					]
				})
				.state("root.transactions.transaction", transactionState());

			this.$get = () => this;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("lootStates", [
			"ui.bootstrap",
			"ui.router",
			"lootAccounts",
			"lootAuthentication",
			"lootCategories",
			"lootPayees",
			"lootSchedules",
			"lootSecurities",
			"lootTransactions"
		])
		.provider("lootStates", LootStatesProvider);

	/**
	 * Dependencies
	 */
	LootStatesProvider.$inject = ["$stateProvider"];
}
