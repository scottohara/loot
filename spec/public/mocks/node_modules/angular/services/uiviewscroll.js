(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$uiViewScrollMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock $uiViewScroll object
		provider.$uiViewScroll = sinon.stub();

		provider.$get = function() {
			return provider.$uiViewScroll;
		};
	}
})();
