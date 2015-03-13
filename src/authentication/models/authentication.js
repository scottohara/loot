(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootAuthentication")
		.factory("authenticationModel", Factory);

	/**
	 * Dependencies
	 */
	Factory.$inject = ["$window", "$http", "$cacheFactory"];

	/**
	 * Implementation
	 */
	function Factory($window, $http, $cacheFactory) {
		var model = {},
				SESSION_STORAGE_KEY = "lootAuthenticationKey";

		// Checks if the API authorisation header is set
		model.isAuthenticated = function() {
			// Get the encoded credentials from sessionStorage
			var authenticationKey = $window.sessionStorage.getItem(SESSION_STORAGE_KEY);

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
			return $http.post("/logins", null, {
				headers: {
					"Authorization": authorisation(authenticationKey)
				}
			}).then(function() {
				// Login successful, store the encoded credentials in sessionStorage
				$window.sessionStorage.setItem(SESSION_STORAGE_KEY, authenticationKey);

				// Set the Authorization header for all http requests
				$http.defaults.headers.common.Authorization = authorisation(authenticationKey);
			});
		};

		// Clear the API authorisation header and stored credentials
		model.logout = function() {
			// Remove the encoded credentials from sessionStorage
			$window.sessionStorage.removeItem(SESSION_STORAGE_KEY);

			// Clear the Authorization header for all http requests
			$http.defaults.headers.common.Authorization = authorisation("");

			// Clear all http caches (except the template cache)
			angular.forEach($cacheFactory.info(), function(cache) {
				if ("templates" !== cache.id) {
					$cacheFactory.get(cache.id).removeAll();
				}
			});
		};

		// Helper function to construct basic authorization header value
		var authorisation = function(authenticationKey) {
			return "Basic " + authenticationKey;
		};

		return model;
	}
})();
