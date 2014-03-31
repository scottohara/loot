(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('payees');

	// Declare the Payee model
	mod.factory('payeeModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('payees');

			// Retrieves the list of payees
			model.all = function() {
				return $http.get('/payees', {
					cache: cache
				}).then(function(response) {
					return response.data;
				});
			};

			// Flush the cache
			model.flush = function() {
				cache.removeAll();
			};

			return model;
		}
	]);
})();
