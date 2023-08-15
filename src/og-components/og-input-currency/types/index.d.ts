import type OgInputCurrencyController from "~/og-components/og-input-currency/controllers/currency";

export interface OgInputCurrencyScope extends angular.IScope {
	vm: OgInputCurrencyController & { precision: string; };
}