import {
	OgInputCurrencyControllerMock,
	OgInputCurrencyControllerType
} from "mocks/og-components/og-input-currency/types";
import {Mock} from "mocks/types";
import OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import sinon from "sinon";

export default class OgInputCurrencyControllerMockProvider implements Mock<OgInputCurrencyControllerMock> {
	private readonly ogInputCurrencyController: OgInputCurrencyControllerMock;

	// Mock input currency controller object
	public constructor() {
		const formattedToRaw = sinon.stub().callsFake((value: string): number => Number(value)),
					rawToFormatted = sinon.stub().callsFake((value: number): string => String(value));

		this.ogInputCurrencyController = ($scope: OgInputCurrencyController): OgInputCurrencyControllerType => {
			$scope.formattedToRaw = formattedToRaw;
			$scope.rawToFormatted = rawToFormatted;

			return {
				type: "ogInputCurrencyController",
				formattedToRaw,
				rawToFormatted
			};
		};
	}

	public $get(): OgInputCurrencyControllerMock {
		// Return the mock input currency controller object
		return this.ogInputCurrencyController;
	}
}

OgInputCurrencyControllerMockProvider.$inject = [];