import type {
	OgInputCurrencyControllerMock,
	OgInputCurrencyControllerType,
} from "~/mocks/og-components/og-input-currency/types";
import type { Mock } from "~/mocks/types";
import type OgInputCurrencyController from "~/og-components/og-input-currency/controllers/currency";
import sinon from "sinon";

export default class OgInputCurrencyControllerMockProvider
	implements Mock<OgInputCurrencyControllerMock>
{
	private readonly ogInputCurrencyController: OgInputCurrencyControllerMock;

	// Mock input currency controller object
	public constructor() {
		this.ogInputCurrencyController = (
			$scope: OgInputCurrencyController,
		): OgInputCurrencyControllerType => {
			const formattedToRaw = sinon
					.stub()
					.callsFake((value: string): number => Number(value)),
				rawToFormatted = sinon
					.stub()
					.callsFake((value: number): string => String(value));

			Object.defineProperty($scope, "formattedToRaw", {
				value: formattedToRaw,
			});
			Object.defineProperty($scope, "rawToFormatted", {
				value: rawToFormatted,
			});

			return {
				type: "ogInputCurrencyController",
				formattedToRaw,
				rawToFormatted,
			};
		};
	}

	public $get(): OgInputCurrencyControllerMock {
		// Return the mock input currency controller object
		return this.ogInputCurrencyController;
	}
}

OgInputCurrencyControllerMockProvider.$inject = [];
