(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $stateMock provider
	mod.provider("$stateMock", function() {
		var provider = this;

		// Mock $state object
		provider.$state = {
			currentState: function(state) {
				provider.$state.includes.withArgs(state).returns(true);
			},
			reload: sinon.stub(),
			go: sinon.stub(),
			includes: sinon.stub().returns(false)
		};

		provider.$get = function() {
			return provider.$state;
		};
	});
})();
