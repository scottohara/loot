(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $stateMock provider
	mod.provider("$stateMock", function() {
		var provider = this;

		// Mock $state object
		provider.$state = {
			reload: sinon.stub(),
			go: sinon.stub()
		};

		provider.$get = function() {
			return provider.$state;
		};
	});
})();
