{
	/**
	 * Implementation
	 */
	class OgInputCurrencyControllerMockProvider {
		// Mock input currency controller object
		ogInputCurrencyController($scope) {
			$scope.setDecimalPlaces = sinon.stub();
			$scope.formattedToRaw = sinon.stub().returnsArg(0);
			$scope.rawToFormatted = sinon.stub().returnsArg(0);

			this.type = "ogInputCurrencyController";
			this.setDecimalPlaces = $scope.setDecimalPlaces;
			this.formattedToRaw = $scope.formattedToRaw;
			this.rawToFormatted = $scope.rawToFormatted;
		}

		$get() {
			// Return the mock input currency controller object
			return this.ogInputCurrencyController;
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponentsMocks")
		.provider("ogInputCurrencyControllerMock", OgInputCurrencyControllerMockProvider);

	/**
	 * Dependencies
	 */
	OgInputCurrencyControllerMockProvider.$inject = [];
}
