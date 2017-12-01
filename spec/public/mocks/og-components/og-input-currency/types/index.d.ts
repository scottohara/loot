import OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import {SinonStub} from "sinon";

export interface OgInputCurrencyControllerType {
	type: "ogInputCurrencyController";
	formattedToRaw: SinonStub;
	rawToFormatted: SinonStub;
}

export interface OgInputCurrencyControllerMock {
	($scope: OgInputCurrencyController): OgInputCurrencyControllerType;
}