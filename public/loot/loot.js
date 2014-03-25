(function () {
	"use strict"

	// Declare the loot module and it's dependencies
	var mod = angular.module('loot', [
		'ui.router',
		'ui.bootstrap',
		'ogComponents',
		'accounts',
		'categories',
		'payees',
		'securities',
		'transactions'
	]);

	// Define the States and URL routing
	mod.config(['$stateProvider', '$urlRouterProvider',
		function ($stateProvider, $urlRouterProvider) {

			// Default to account list for any unmatched URLs
			$urlRouterProvider.otherwise('/accounts');

			$stateProvider
				.state('accounts', {
					url: '/accounts',
					templateUrl: 'accounts/views/index.html',
					controller: 'accountIndexController'
				})
				.state('payees', {
					url: '/payees',
					templateUrl: 'payees/views/index.html',
					controller: 'payeeIndexController'
				})
				.state('categories', {
					url: '/categories',
					templateUrl: 'categories/views/index.html',
					controller: 'categoryIndexController'
				})
				.state('account', {
					url: '/accounts/:accountId',
					templateUrl: 'accounts/views/edit.html'
				})
				.state('accountTransactions', {
					url: '/accounts/:accountId/transactions',
					templateUrl: 'transactions/views/index.html',
					controller: 'transactionIndexController',
					resolve: {
						account: ['$stateParams', 'accountModel',
							function($stateParams, accountModel) {
								return accountModel.find($stateParams.accountId);
							}
						]
					}
				});
		}
	]);

})();
