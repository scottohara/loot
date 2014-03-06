(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('payees');

	// Declare the Payee model
	mod.factory('payeeModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves the list of payees
			model.all = function() {
				return $http.get('/payees', {
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
