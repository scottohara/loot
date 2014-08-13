(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("authenticationMocks");

	// Declare the authenticationModelMock provider
	mod.provider("authenticationModelMock", function() {
		var provider = this;

		// Mock authenticationModel object
		provider.authenticationModel = {
			login: sinon.stub(),
			logout: sinon.stub(),
			isAuthenticated: true
		};

		// Successful login response
		provider.authenticationModel.login.withArgs("gooduser", "goodpassword").returns({
			then: function(successCallback) {
				successCallback();
			}
		});

		// Unsuccessful login response
		provider.authenticationModel.login.withArgs("baduser", "badpassword").returns({
			then: function(successCallback, errorCallback) {
				errorCallback({data: "login unsuccessful"});
			}
		});

		provider.$get = function() {
			// Return the mock authenticationModel object
			return provider.authenticationModel;
		};
	});
})();
