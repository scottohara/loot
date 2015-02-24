(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("ogInputNumberControllerMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock input number controller object
		provider.ogInputNumberController = function() {
			this.type = "ogInputNumberController";
			this.formattedToRaw = sinon.stub().returnsArg(0);
			this.rawToFormatted = sinon.stub().returnsArg(0);
		};

		provider.$get = function() {
			// Return the mock input number controller object
			return provider.ogInputNumberController;
		};
	}
})();
