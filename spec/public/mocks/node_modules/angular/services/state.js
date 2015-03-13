(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$stateMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock $state object
		provider.$state = {
			currentState: function(state) {
				provider.$state.includes.withArgs(state).returns(true);
			},
			reload: sinon.stub(),
			go: sinon.stub(),
			includes: sinon.stub().returns(false),
			params: {}
		};

		provider.$get = function() {
			return provider.$state;
		};
	}
})();
