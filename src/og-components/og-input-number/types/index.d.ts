import type OgInputNumberController from "~/og-components/og-input-number/controllers/number";

export interface OgInputNumberScope extends angular.IScope {
	vm: OgInputNumberController & { precision: string };
}
