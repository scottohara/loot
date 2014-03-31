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
				.state('root.payees', {
					url: '/payees',
					templateUrl: 'payees/views/index.html',
					controller: 'payeeIndexController',
					data: {
						title: 'Payees'
					}
				})
				.state('root.categories', {
					url: '/categories',
					templateUrl: 'categories/views/index.html',
					controller: 'categoryIndexController',
					data: {
						title: 'Categories'
					}
				})
				.state('root.securities', {
					url: '/securities',
					templateUrl: 'securities/views/index.html',
					controller: 'securityIndexController',
					data: {
						title: 'Securities'
					}
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
					views: {
						'@root': {
							templateUrl: 'transactions/views/index.html',
							controller: 'transactionIndexController'
						}
					}
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
