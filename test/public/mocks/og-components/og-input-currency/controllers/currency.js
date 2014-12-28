(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponentsMocks");

	// Declare the ogInputCurrencyControllerMock provider
	mod.provider("ogInputCurrencyControllerMock", function() {
		var provider = this;

		// Mock input currency controller object
		provider.ogInputCurrencyController = function($scope) {
			$scope.setDecimalPlaces = sinon.stub();
			$scope.formattedToRaw = sinon.stub().returnsArg(0);
			$scope.rawToFormatted = sinon.stub().returnsArg(0);

			this.type = "ogInputCurrencyController";
			this.setDecimalPlaces = $scope.setDecimalPlaces;
			this.formattedToRaw = $scope.formattedToRaw;
			this.rawToFormatted = $scope.rawToFormatted;
		};

		provider.$get = function() {
			// Return the mock input currency controller object
			return provider.ogInputCurrencyController;
		};
	});
})();
