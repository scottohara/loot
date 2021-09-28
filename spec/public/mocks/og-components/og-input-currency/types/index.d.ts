import type OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import type { SinonStub } from "sinon";

export interface OgInputCurrencyControllerType {
	type: "ogInputCurrencyController";
	formattedToRaw: SinonStub;
	rawToFormatted: SinonStub;
}

export type OgInputCurrencyControllerMock = ($scope: OgInputCurrencyController) => OgInputCurrencyControllerType;