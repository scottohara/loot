import angular from "angular";

export default class AuthenticationModel {
	private readonly SESSION_STORAGE_KEY = "lootAuthenticationKey";

	public constructor(private readonly $window: angular.IWindowService,
						private readonly $http: angular.IHttpService,
						private readonly $cacheFactory: angular.ICacheFactoryService) {}

	// Checks if the API authorisation header is set
	public get isAuthenticated(): boolean {
		// Get the encoded credentials from sessionStorage
		const authenticationKey: string | null = this.$window.sessionStorage.getItem(this.SESSION_STORAGE_KEY);

		if (null !== authenticationKey) {
			// Set the Authorization header for all http requests
			this.setAuthorisationHeader(authenticationKey);

			return true;
		}

		// Not authenticated
		return false;
	}

	// Validate the user credentials and set the API authorisation header
	public login(username: string | null, password: string | null): angular.IPromise<void> {
		// Base64 encode the credentials
		const authenticationKey: string = this.$window.btoa(`${username}:${password}`);

		// Validate the credentials
		return this.$http.post("/logins", "", {
			headers: {
				Authorization: this.authorisation(authenticationKey)
			}
		}).then((): void => {
			// Login successful, store the encoded credentials in sessionStorage
			this.$window.sessionStorage.setItem(this.SESSION_STORAGE_KEY, authenticationKey);

			// Set the Authorization header for all http requests
			this.setAuthorisationHeader(authenticationKey);
		});
	}

	// Clear the API authorisation header and stored credentials
	public logout(): void {
		// Remove the encoded credentials from sessionStorage
		this.$window.sessionStorage.removeItem(this.SESSION_STORAGE_KEY);

		// Clear the Authorization header for all http requests
		this.setAuthorisationHeader("");

		// Clear all http caches (except the template cache)
		angular.forEach(this.$cacheFactory.info(), ({ id }: { id: string; }): void => {
			if ("templates" !== id) {
				this.$cacheFactory.get(id).removeAll();
			}
		});
	}

	// Helper function to construct basic authorization header value
	private authorisation(authenticationKey: string): string {
		return `Basic ${authenticationKey}`;
	}

	// Set the Authorization header for all http requests
	private setAuthorisationHeader(authenticationKey: string): void {
		const headers: angular.IHttpRequestConfigHeaders = { ...this.$http.defaults.headers };

		headers.common = { ...headers.common as Record<string, unknown> };
		headers.common.Authorization = this.authorisation(authenticationKey);
		this.$http.defaults.headers = headers;
	}
}

AuthenticationModel.$inject = ["$window", "$http", "$cacheFactory"];