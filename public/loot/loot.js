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
					templateUrl: 'accounts/views/accounts.html'
				})
				.state('account', {
					url: '/accounts/:accountId',
					templateUrl: 'accounts/views/account.html'
				})
				.state('accountTransactions', {
					url: '/accounts/:accountId/transactions',
					templateUrl: 'transactions/views/transactions.html',
					controller: 'transactionsController'
				});
		}
	]);

})();
