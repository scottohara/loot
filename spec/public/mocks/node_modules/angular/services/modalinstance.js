(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$modalInstanceMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock $modalInstance object
		provider.$modalInstance = {
			close: sinon.stub(),
			dismiss: sinon.stub()
		};

		provider.$get = function() {
			return provider.$modalInstance;
		};
	}
})();
