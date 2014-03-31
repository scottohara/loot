(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('authentication');

	// Declare the Authentication model
	mod.factory('authenticationModel', ['$window', '$http', '$cacheFactory',
		function($window, $http, $cacheFactory) {
			var model = {};

			// Checks if the API authorisation header is set
			model.isAuthenticated = function() {
				// Get the encoded credentials from sessionStorage
				var authenticationKey = $window.sessionStorage.getItem("lootAuthenticationKey");

				if (authenticationKey) {
					// Set the Authorization header for all http requests
					$http.defaults.headers.common.Authorization = authorisation(authenticationKey);
					return true;
				} else {
					// Not authenticated
					return false;
				}
			};

			// Validate the user credentials and set the API authorisation header
			model.login = function(username, password) {
				// Base64 encode the credentials
				var authenticationKey = $window.btoa(username + ":" + password);

				// Validate the credentials
				return $http.post('/logins', null, {
					headers: {
						'Authorization': authorisation(authenticationKey)
					}
				}).then(function() {
					// Login successful, store the encoded credentials in sessionStorage
					$window.sessionStorage.setItem("lootAuthenticationKey", authenticationKey);

					// Set the Authorization header for all http requests
					$http.defaults.headers.common.Authorization = authorisation(authenticationKey);
				});
			};

			// Clear the API authorisation header and stored credentials
			model.logout = function() {
				// Remove the encoded credentials from sessionStorage
				$window.sessionStorage.removeItem("lootAuthenticationKey");

				// Clear the Authorization header for all http requests
				$http.defaults.headers.common.Authorization = authorisation('');

				// Clear all http caches (except the template cache)
				angular.forEach($cacheFactory.info(), function(cache) {
					if ("templates" !== cache.id) {
						$cacheFactory.get(cache.id).removeAll();
					}
				});
			};

			// Helper function to construct basic authorization header value
			var authorisation = function(authenticationKey) {
				return 'Basic ' + authenticationKey;
			};

			return model;
		}
	]);
})();
