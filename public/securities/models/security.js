(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('securities');

	// Declare the Security model
	mod.factory('securityModel', ['$http', '$cacheFactory',
		function($http, $cacheFactory) {
			var	model = {},
					cache = $cacheFactory('securities');

			// Retrieves the list of securities
			model.all = function() {
				return $http.get('/securities', {
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
