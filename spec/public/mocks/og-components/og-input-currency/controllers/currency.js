(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("ogInputCurrencyControllerMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this;

		// Mock input currency controller object
		provider.ogInputCurrencyController = ["$scope",
			function($scope) {
				$scope.setDecimalPlaces = sinon.stub();
				$scope.formattedToRaw = sinon.stub().returnsArg(0);
				$scope.rawToFormatted = sinon.stub().returnsArg(0);

				this.type = "ogInputCurrencyController";
				this.setDecimalPlaces = $scope.setDecimalPlaces;
				this.formattedToRaw = $scope.formattedToRaw;
				this.rawToFormatted = $scope.rawToFormatted;
			}
		];

		provider.$get = function() {
			// Return the mock input currency controller object
			return provider.ogInputCurrencyController;
		};
	}
})();
