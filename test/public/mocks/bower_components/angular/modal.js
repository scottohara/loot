(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $modalMock provider
	mod.provider("$modalMock", function() {
		var provider = this;

		// Mock $modal object
		provider.$modal = {
			open: sinon.stub().returns({
				result: {
					then: function(callback) {
						callback();
					}
				}
			})
		};

		provider.$get = function() {
			return provider.$modal;
		};
	});
})();
