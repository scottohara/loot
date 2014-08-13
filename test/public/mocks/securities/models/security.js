(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securitiesMocks");

	// Declare the securityModelMock provider
	mod.provider("securityModelMock", function() {
		var provider = this;

		// Helper function to configure stub responses
		var responses = function(stub, successArgs, errorArgs) {
			stub.withArgs(sinon.match(successArgs)).returns({
				then: function(successCallback) {
					successCallback({data: successArgs});
				}
			});

			stub.withArgs(sinon.match(errorArgs)).returns({
				then: function(successCallback, errorCallback) {
					errorCallback({data: "unsuccessful"});
				}
			});

			return stub;
		};

		// Mock securityModel object
		provider.securityModel = {
			recent: "recent securities list",
			save: responses(sinon.stub(), {id: 1}, {id: -1}),
			destroy: responses(sinon.stub(), {id: 1}, {id: -1}),
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock securityModel object
			return provider.securityModel;
		};
	});

	// Declare the securityMock provider
	mod.provider("securityMock", function() {
		var provider = this;

		// Mock security object
		provider.security = {id: 1};

		provider.$get = function() {
			// Return the mock security object
			return provider.security;
		};
	});
})();
