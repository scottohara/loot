(function () {
	"use strict";

	// Reopen the module
	var mod = angular.module("states", [
		"ui.router"
	]);

	// Declare the lootStates provider
	mod.provider("lootStates", ["$stateProvider",
		function($stateProvider) {
			var	basicState = function() {
						return {
							url: "/:id",
						};
					},
					transactionViews = {
						"@root": {
							templateUrl: "transactions/views/index.html",
							controller: "transactionIndexController"
						}
					},
					transactionsState = function(parentContext) {
						return {
							url: "/transactions",
							data: {
								title: parentContext.charAt(0).toUpperCase() + parentContext.substring(1) + " Transactions"
							},
							resolve: {
								contextModel: [parentContext + "Model",
									function(contextModel) {
										return contextModel;
									}
								],
								context: ["$stateParams", "contextModel",
									function($stateParams, contextModel) {
										return contextModel.find($stateParams.id);
									}
								],
								transactionBatch: ["transactionModel", "contextModel", "context",
									function(transactionModel, contextModel, context) {
										var unreconciledOnly = contextModel.isUnreconciledOnly ? contextModel.isUnreconciledOnly(context.id) : false;
										return transactionModel.all(contextModel.path(context.id), null, "prev", unreconciledOnly);
									}
								]
							},
							views: transactionViews
						};
					},
					transactionState = function() {
						return {
							url: "/:transactionId"
						};
					};

			$stateProvider
				.state("root", {
					abstract: true,
					templateUrl: "loot/views/layout.html",
					controller: "layoutController",
					data: {
						title: "Welcome"
					},
					resolve: {
						authenticated: ["$modal", "authenticationModel",
							function($modal, authenticationModel) {
								if (!authenticationModel.isAuthenticated()) {
									return $modal.open({
										templateUrl: "authentication/views/edit.html",
										controller: "authenticationEditController",
										backdrop: "static",
										size: "sm"
									}).result.catch(function() {
										// If the login modal is dismissed, catch here so
										// that the promise resolves and the state transition
										// completes (to show the login alert message)
									});
								}
							}
						]
					}
				})
				.state("root.accounts", {
					url: "/accounts",
					templateUrl: "accounts/views/index.html",
					controller: "accountIndexController",
					data: {
						title: "Accounts"
					}
				})
				.state("root.accounts.account", basicState())
				.state("root.accounts.account.transactions", transactionsState("account"))
				.state("root.accounts.account.transactions.transaction", transactionState())
				.state("root.schedules", {
					url: "/schedules",
					templateUrl: "schedules/views/index.html",
					controller: "scheduleIndexController",
					data: {
						title: "Schedules"
					},
					resolve: {
						schedules: ["scheduleModel",
							function(scheduleModel) {
								return scheduleModel.all();
							}
						]
					}
				})
				.state("root.schedules.schedule", basicState())
				.state("root.payees", {
					url: "/payees",
					templateUrl: "payees/views/index.html",
					controller: "payeeIndexController",
					data: {
						title: "Payees"
					},
					resolve: {
						payees: ["payeeModel",
							function(payeeModel) {
								return payeeModel.all();
							}
						]
					}
				})
				.state("root.payees.payee", basicState())
				.state("root.payees.payee.transactions", transactionsState("payee"))
				.state("root.payees.payee.transactions.transaction", transactionState())
				.state("root.categories", {
					url: "/categories",
					templateUrl: "categories/views/index.html",
					controller: "categoryIndexController",
					data: {
						title: "Categories"
					},
					resolve: {
						categories: ["categoryModel",
							function(categoryModel) {
								return categoryModel.allWithChildren();
							}
						]
					}
				})
				.state("root.categories.category", basicState())
				.state("root.categories.category.transactions", transactionsState("category"))
				.state("root.categories.category.transactions.transaction", transactionState())
				.state("root.securities", {
					url: "/securities",
					templateUrl: "securities/views/index.html",
					controller: "securityIndexController",
					data: {
						title: "Securities"
					},
					resolve: {
						securities: ["securityModel",
							function(securityModel) {
								return securityModel.allWithBalances();
							}
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
						contextModel: function() {
							return null;
						},
						context: ["$stateParams",
							function($stateParams) {
								return $stateParams.query;
							}
						],
						transactionBatch: ["transactionModel", "context",
							function(transactionModel, context) {
								return transactionModel.query(context, null, "prev");
							}
						]
					},
					views: transactionViews
				})
				.state("root.transactions.transaction", transactionState());

			this.$get = function() {
				return this;
			};
		}
	]);
})();
