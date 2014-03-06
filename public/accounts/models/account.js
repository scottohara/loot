(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('accounts');

	// Declare the Account model
	mod.factory('accountModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves the list of accounts
			model.all = function() {
				return $http.get('/accounts', {
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
