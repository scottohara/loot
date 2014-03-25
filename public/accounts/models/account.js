(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('accounts');

	// Declare the Account model
	mod.factory('accountModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves the list of accounts
			model.all = function(includeBalances) {
				return $http.get('/accounts' + (includeBalances ? "?include_balances" : ""), {
					headers: {
						accept: 'application/json'
					},
					cache: !includeBalances
				}).then(function(response) {
					return response.data;
				});
			};

			// Retrieves the list of accounts, including balances
			model.allWithBalances = function() {
				return model.all(true);
			};

			// Retrieves a single account by it's ID
			model.find = function(id) {
				return $http.get('/accounts/' + id, {
					headers: {
						accept: 'application/json'
					},
					cache: true
				}).then(function(response) {
					return response.data;
				});
			};

			return model;
		}
	]);
})();
