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
				.state('root.payees.payee', {
					url: '/:payeeId'
				})
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
				.state('root.categories.category', {
					url: '/:categoryId'
				})
				.state('root.categories.category.subcategories', {
					url: '/subcategories'
				})
				.state('root.categories.category.subcategories.subcategory', {
					url: '/:subcategoryId'
				})
				.state('root.securities', {
					url: '/securities',
					templateUrl: 'securities/views/index.html',
					controller: 'securityIndexController',
					data: {
						title: 'Securities'
					}
				})
				.state('root.securities.security', {
					url: '/:securityId'
				})
				.state('root.accounts.account', {
					abstract: true,
					url: '/:accountId',
					resolve: {
						account: ['$stateParams', 'accountModel',
							function($stateParams, accountModel) {
								return accountModel.find($stateParams.accountId);
							}
						]
					}
				})
				.state('root.accounts.account.transactions', {
					url: '/transactions',
					data: {
						title: 'Transactions'
					},
					resolve: {
						transactionBatch: ['accountModel', 'transactionModel', 'account',
							function(accountModel, transactionModel, account) {
								return transactionModel.findByAccount(account.id, null, 'prev', accountModel.isUnreconciledOnly(account.id));
							}
						]
					},
					views: {
						'@root': {
							templateUrl: 'transactions/views/index.html',
							controller: 'transactionIndexController'
						}
					}
				})
				.state('root.accounts.account.transactions.transaction', {
					url: '/:transactionId'
				});
		}
	]);

	// Runtime initialisation
	mod.run(['$rootScope', '$state',
		function($rootScope, $state) {
			$rootScope.$state = $state;
		}
	]);
})();
