(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$qMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock $q object
		provider.$q = {
			defer: function() {
				var isResolved = false,
						promiseValue,
						callbackResult;

				var updateValueAndReturn = function(callbackResult, promise) {
					// If the callback yielded a promise, we'll simply return that
					if (callbackResult && callbackResult.then && angular.isFunction(callbackResult.then)) {
						return callbackResult;
					}
					
					// Otherwise, update the promise value to the callback result; and return the existing promise
					promiseValue = callbackResult || promiseValue;
					return promise;
				};

				return {
					resolve: function(value) {
						promiseValue = value;
						isResolved = true;
					},
					reject: function(value) {
						promiseValue = value;
					},
					promise: {
						then: function(successCallback, errorCallback) {
							if (isResolved) {
								callbackResult = successCallback(promiseValue);
							} else {
								if (errorCallback) {
									callbackResult = errorCallback(promiseValue);
								}
							}
							return updateValueAndReturn(callbackResult, this);
						},
						catch: function(errorCallback) {
							if (!isResolved) {
								callbackResult = errorCallback(promiseValue);
							}
							return updateValueAndReturn(callbackResult, this);
						}
					}
				};
			},
			promisify: function(success, error) {
				// Helper function to promise-ify a stub with success and error responses
				
				// Create two new promises, one for a success and one for an error
				var qSuccess = provider.$q.defer(),
						qError = provider.$q.defer(),
						stub = sinon.stub();

				// Auto-resolve the success promise with the specified success response
				qSuccess.resolve(success && success.response);

				// Auto-reject the error promise with the specified error response
				qError.reject(error && error.response || {data: "unsuccessful"});

				// Configure the stub to return the appropriate promise based on the call arguments
				if (!success || (angular.isObject(success) && !success.args)) {
					// No success args specified, so default response is a success
					stub.returns(qSuccess.promise);
				} else {
					stub.withArgs(sinon.match(success.args || success)).returns(qSuccess.promise);
				}

				if (error) {
					stub.withArgs(sinon.match(error && error.args || error)).returns(qError.promise);
				}

				return stub;
			}
		};

		provider.$get = function() {
			// Return the mock $q object
			return provider.$q;
		};
	}
})();
