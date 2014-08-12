(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("securitiesMocks");

	// Declare the securityModelMock provider
	mod.provider("securityModelMock", function() {
		var provider = this;

		// Mock securityModel object
		provider.securityModel = {
			flush: sinon.stub()
		};

		provider.$get = function() {
			// Return the mock securityModel object
			return provider.securityModel;
		};
	});
})();
