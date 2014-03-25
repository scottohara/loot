(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security model
	mod.factory('securityModel', ['$http',
		function($http) {
			var model = {};

			// Retrieves the list of securities
			model.all = function() {
				return $http.get('/securities', {
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
