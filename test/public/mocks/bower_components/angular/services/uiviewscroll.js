(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $uiViewScrollMock provider
	mod.provider("$uiViewScrollMock", function() {
		var provider = this;

		// Mock $uiViewScroll object
		provider.$uiViewScroll = sinon.stub();

		provider.$get = function() {
			return provider.$uiViewScroll;
		};
	});
})();
