import "../css/og-input-calculator.less";
import type {
	OgInputCalculatorOperation,
	OgInputCalculatorOperator,
	OgInputCalculatorScope
} from "og-components/og-input-calculator/types";
import OgInputCalculatorView from "og-components/og-input-calculator/views/calculator.html";
import type OgInputCurrencyController from "og-components/og-input-currency/controllers/currency";
import type OgInputNumberController from "og-components/og-input-number/controllers/number";
import type OgModalErrorService from "og-components/og-modal-error/services/og-modal-error";
import angular from "angular";

export default class OgInputCalculatorDirective {
	public constructor($window: angular.IWindowService, $timeout: angular.ITimeoutService, ogModalErrorService: OgModalErrorService) {
		const showError: (message?: string) => void = ogModalErrorService.showError.bind(ogModalErrorService),
					directive: angular.IDirective = {
						restrict: "A",
						require: ["ngModel", "?ogInputCurrency", "?ogInputNumber"],
						replace: true,
						templateUrl: OgInputCalculatorView,
						link(scope: OgInputCalculatorScope, iElement: JQuery<Element>, iAttrs: angular.IAttributes, controllers: angular.IController[]): void {
							// Get the position of the popover, or default to left if unspecified
							scope.position = undefined === iAttrs.ogInputCalculator || "" === iAttrs.ogInputCalculator ? "left" : String(iAttrs.ogInputCalculator);

							const [ngModel] = controllers,
										ogInputCurrency = 1,
										ogInputNumber = 2,
										ACTION_KEYS: Record<string, () => void> = {
											13(): void {
												// Enter
												scope.update();
											},
											27(): void {
												// Esc
												scope.cancel();
											},
											187(): void {
												// Equals
												scope.update();
											}
										};

							scope.ogInput = null === controllers[ogInputCurrency] as angular.IController | null ? controllers[ogInputNumber] as OgInputNumberController : controllers[ogInputCurrency] as OgInputCurrencyController;

							// Push an operation onto the stack
							scope.push = (operand: number, operator: OgInputCalculatorOperator): void => {
								// Push the operand on the stack
								if (scope.stack.length) {
									scope.stack[scope.stack.length - 1].operand = operand;
								} else {
									scope.stack.push({ operand });

									// Show the popover
									$timeout((): boolean => angular.element(iElement)[0].dispatchEvent(new Event("showCalculator"))).catch(showError);
								}

								// Push the operator onto the stack
								scope.stack.push({ operator });

								// Update the display expression
								$timeout((): string => (scope.expression = `\n${operator} ${scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(operand))) + (" " === scope.expression ? "" : scope.expression)}`)).catch(showError);
							};

							// Perform the calculation
							scope.calculate = (value: string): void => {
								// Default the result to the current view value
								scope.result = Number(scope.ogInput.formattedToRaw(value));

								// Make the current view value available on the scope
								scope.current = scope.ogInput.rawToFormatted(Number(scope.result));

								if (scope.stack.length > 1) {
									scope.result = Number(scope.stack.reduce((memo: OgInputCalculatorOperation, operation: OgInputCalculatorOperation, index: number): OgInputCalculatorOperation => {
										const result: OgInputCalculatorOperation & { operand: number; } = { operand: 0, ...memo };

										// Last time through, use the view value for the operand
										if (index === scope.stack.length - 1) {
											operation.operand = scope.ogInput.formattedToRaw(value);
										}

										switch (operation.operator) {
											case "+":
												result.operand += Number(operation.operand);
												break;

											case "-":
												result.operand -= Number(operation.operand);
												break;

											case "*":
												result.operand *= Number(operation.operand);
												break;

											case "/":
												result.operand /= Number(operation.operand);
												break;

											default:
										}

										return result;
									}).operand);
								}

								scope.formattedResult = scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(scope.result)));
							};

							// Handle input value changes
							scope.inputChanged = (value: string): string => {
								// Matches any number of digits, periods or commas, followed by +, -, * or /
								const	matches: RegExpExecArray | null = (/(?<operand>[-\d.,]+)(?<operator>[+\-*/])(?<residual>.*)/giu).exec(value);

								if (null !== matches && undefined !== matches.groups) {
									const { operand, operator, residual } = matches.groups;

									// Push the first (operand) and second (operator) matches onto the stack
									scope.push(Number(operand), operator as OgInputCalculatorOperator);

									// Update the view value to the third match (anything after the operator), which is typically an empty string
									iElement.val(residual);
								} else {
									// Recalculate
									scope.calculate(value);
								}

								// Return the current result
								return String(scope.result);
							};

							// View to model
							(ngModel as angular.INgModelController).$parsers.push(scope.inputChanged);

							// Update the input value and hide the calculator
							scope.update = (): void => {
								// Reset the stack
								scope.clear();

								// Set the value
								iElement.val(scope.result);

								// Hide the popover
								scope.close();
							};

							// Cancel the calculation and hide the calculator
							scope.cancel = (): void => {
								scope.clear();
								scope.close();
							};

							// Clear the stack
							scope.clear = (): void => {
								scope.stack = [];
								scope.expression = " ";
							};

							// Close the popover
							scope.close = (): void => {
								$timeout((): boolean => angular.element(iElement)[0].dispatchEvent(new Event("hideCalculator"))).catch(showError);
							};

							// Start with a cleared calculator
							scope.clear();

							function keyHandler(event: JQueryKeyEventObject): void {
								scope.keyHandler(event);
							}

							function update(): void {
								if (scope.stack.length) {
									scope.update();
								}
							}

							// Declare key handler to detect operators and actions
							scope.keyHandler = (event: JQueryKeyEventObject): void => {
								// Check if the key pressed was an action key, and there is a pending calculation (otherwise, let the event propagate)
								if (!event.shiftKey && undefined !== Object.getOwnPropertyDescriptor(ACTION_KEYS, event.keyCode) && scope.stack.length) {
									// Invoke the action
									ACTION_KEYS[event.keyCode]();

									// Select the new input value
									$timeout((): unknown => $window.$(iElement).select() as unknown).catch(showError);

									// Swallow the event
									event.preventDefault();
									event.stopPropagation();
								}
							};

							iElement.on("keydown", keyHandler);
							iElement.on("blur", update);

							// When the element is destroyed, remove all event handlers
							iElement.on("$destroy", (): void => {
								iElement.off("keydown", keyHandler);
								iElement.off("blur", update);
							});
						}
					};

		return directive;
	}

	public static factory($window: angular.IWindowService, $timeout: angular.ITimeoutService, ogModalErrorService: OgModalErrorService): OgInputCalculatorDirective {
		return new OgInputCalculatorDirective($window, $timeout, ogModalErrorService);
	}
}

OgInputCalculatorDirective.factory.$inject = ["$window", "$timeout", "ogModalErrorService"];