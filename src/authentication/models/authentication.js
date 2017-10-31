import angular from "angular";

export default class AuthenticationModel {
	constructor($window, $http, $cacheFactory) {
		this.$window = $window;
		this.$http = $http;
		this.$cacheFactory = $cacheFactory;
	}

	get SESSION_STORAGE_KEY() {
		return "lootAuthenticationKey";
	}

	// Checks if the API authorisation header is set
	get isAuthenticated() {
		// Get the encoded credentials from sessionStorage
		const authenticationKey = this.$window.sessionStorage.getItem(this.SESSION_STORAGE_KEY);

		if (authenticationKey) {
			// Set the Authorization header for all http requests
			this.$http.defaults.headers.common.Authorization = this.authorisation(authenticationKey);

			return true;
		}

		// Not authenticated
		return false;
	}

	// Validate the user credentials and set the API authorisation header
	login(username, password) {
		// Base64 encode the credentials
		const authenticationKey = this.$window.btoa(`${username}:${password}`);

		// Validate the credentials
		return this.$http.post("/logins", null, {
			headers: {
				Authorization: this.authorisation(authenticationKey)
			}
		}).then(() => {
			// Login successful, store the encoded credentials in sessionStorage
			this.$window.sessionStorage.setItem(this.SESSION_STORAGE_KEY, authenticationKey);

			// Set the Authorization header for all http requests
			this.$http.defaults.headers.common.Authorization = this.authorisation(authenticationKey);
		});
	}

	// Clear the API authorisation header and stored credentials
	logout() {
		// Remove the encoded credentials from sessionStorage
		this.$window.sessionStorage.removeItem(this.SESSION_STORAGE_KEY);

		// Clear the Authorization header for all http requests
		this.$http.defaults.headers.common.Authorization = this.authorisation("");

		// Clear all http caches (except the template cache)
		angular.forEach(this.$cacheFactory.info(), cache => {
			if ("templates" !== cache.id) {
				this.$cacheFactory.get(cache.id).removeAll();
			}
		});
	}

	// Helper function to construct basic authorization header value
	authorisation(authenticationKey) {
		return `Basic ${authenticationKey}`;
	}
}

AuthenticationModel.$inject = ["$window", "$http", "$cacheFactory"];