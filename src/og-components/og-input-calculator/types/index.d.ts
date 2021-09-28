import type OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import type OgInputNumberController from "og-components/og-input-number/controllers/number";

export type OgInputCalculatorOperator = "-" | "*" | "/" | "+";

export interface OgInputCalculatorOperation {
	operand?: number;
	operator?: OgInputCalculatorOperator;
}

export interface OgInputCalculatorScope extends angular.IScope {
	position: string;
	ogInput: OgInputCurrencyController | OgInputNumberController;
	stack: OgInputCalculatorOperation[];
	expression: string;
	result: number;
	current: string;
	formattedResult: string;
	push: (operand: number, operator: OgInputCalculatorOperator) => void;
	calculate: (value: string) => void;
	inputChanged: (value: string) => string;
	update: () => void;
	cancel: () => void;
	clear: () => void;
	close: () => void;
	keyHandler: (event: JQueryKeyEventObject) => void;
}