(function () {
	"use strict"

	// Declare the loot module and it's dependencies
	var mod = angular.module('loot', [
		'ui.router',
		'ui.bootstrap',
		'ogComponents',
		'authentication',
		'accounts',
		'categories',
		'payees',
		'schedules',
		'securities',
		'transactions'
	]);

	// Define the States and URL routing
	mod.config(['$httpProvider', '$stateProvider', '$urlRouterProvider',
		function($httpProvider, $stateProvider, $urlRouterProvider) {
			// All HTTP requests will be JSON
			$httpProvider.defaults.headers.common.Accept = 'application/json';

			// Default to account list for any unmatched URLs
			$urlRouterProvider.otherwise('/accounts');

			var	basicState = function() {
						return {
							url: '/:id',
						};
					},
					transactionsState = function(parentContext) {
						return {
							url: '/transactions',
							data: {
								title: parentContext.charAt(0).toUpperCase() + parentContext.substring(1) + ' Transactions'
							},
							resolve: {
								contextModel: [parentContext + 'Model',
									function(contextModel) {
										return contextModel;
									}
								],
								context: ['$stateParams', 'contextModel',
									function($stateParams, contextModel) {
										return contextModel.find($stateParams.id);
									}
								],
								transactionBatch: ['transactionModel', 'contextModel', 'context',
									function(transactionModel, contextModel, context) {
										var unreconciledOnly = contextModel.isUnreconciledOnly ? contextModel.isUnreconciledOnly(context.id) : false;
										return transactionModel.all(contextModel.path(context.id), null, 'prev', unreconciledOnly);
									}
								]
							},
							views: {
								'@root': {
									templateUrl: 'transactions/views/index.html',
									controller: 'transactionIndexController'
								}
							}
						};
					},
					transactionState = function() {
						return {
							url: '/:transactionId'
						};
					};

			$stateProvider
				.state('root', {
					abstract: true,
					templateUrl: 'loot/views/layout.html',
					controller: 'layoutController',
					data: {
						title: 'Welcome'
					},
					resolve: {
						authenticated: ['$modal', 'authenticationModel',
							function($modal, authenticationModel) {
								if (!authenticationModel.isAuthenticated()) {
									return $modal.open({
										templateUrl: 'authentication/views/edit.html',
										controller: 'authenticationEditController',
										backdrop: 'static'
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
				.state('root.accounts', {
					url: '/accounts',
					templateUrl: 'accounts/views/index.html',
					controller: 'accountIndexController',
					data: {
						title: 'Accounts'
					}
				})
				.state('root.accounts.account', basicState())
				.state('root.accounts.account.transactions', transactionsState('account'))
				.state('root.accounts.account.transactions.transaction', transactionState())
				.state('root.schedules', {
					url: '/schedules',
					templateUrl: 'schedules/views/index.html',
					controller: 'scheduleIndexController',
					data: {
						title: 'Schedules'
					}
				})
				.state('root.payees', {
					url: '/payees',
					templateUrl: 'payees/views/index.html',
					controller: 'payeeIndexController',
					data: {
						title: 'Payees'
					},
					resolve: {
						payees: ['payeeModel',
							function(payeeModel) {
								return payeeModel.all();
							}
						]
					}
				})
				.state('root.payees.payee', basicState())
				.state('root.payees.payee.transactions', transactionsState('payee'))
				.state('root.payees.payee.transactions.transaction', transactionState())
				.state('root.categories', {
					url: '/categories',
					templateUrl: 'categories/views/index.html',
					controller: 'categoryIndexController',
					data: {
						title: 'Categories'
					},
					resolve: {
						categories: ['categoryModel',
							function(categoryModel) {
								return categoryModel.allWithChildren();
							}
						]
					}
				})
				.state('root.categories.category', basicState())
				.state('root.categories.category.transactions', transactionsState('category'))
				.state('root.categories.category.transactions.transaction', transactionState())
				.state('root.securities', {
					url: '/securities',
					templateUrl: 'securities/views/index.html',
					controller: 'securityIndexController',
					data: {
						title: 'Securities'
					}
				})
				.state('root.securities.security', basicState());
		}
	]);

	// Runtime initialisation
	mod.run(['$rootScope', '$state',
		function($rootScope, $state) {
			$rootScope.$state = $state;
		}
	]);
})();
