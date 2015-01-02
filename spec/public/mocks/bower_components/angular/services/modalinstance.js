(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $modalInstanceMock provider
	mod.provider("$modalInstanceMock", function() {
		var provider = this;

		// Mock $modalInstance object
		provider.$modalInstance = {
			close: sinon.stub(),
			dismiss: sinon.stub()
		};

		provider.$get = function() {
			return provider.$modalInstance;
		};
	});
})();
