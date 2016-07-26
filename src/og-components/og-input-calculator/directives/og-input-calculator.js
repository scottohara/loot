{
	/**
	 * Implementation
	 */
	class OgInputCalculatorDirective {
		constructor($timeout) {
			return {
				restrict: "A",
				require: ["ngModel", "?ogInputCurrency", "?ogInputNumber"],
				replace: true,
				templateUrl: "og-components/og-input-calculator/views/calculator.html",
				link: (scope, iElement, iAttrs, controllers) => {
					// Get the position of the popover, or default to left if unspecified
					scope.position = iAttrs.ogInputCalculator || "left";

					const ngModel = controllers[0],
								ogInputCurrency = 1,
								ogInputNumber = 2,
								ACTION_KEYS = {
									13() {
										// Enter
										scope.update();
									},
									27() {
										// Esc
										scope.cancel();
									},
									187() {
										// Equals
										scope.update();
									}
								};

					scope.ogInput = controllers[ogInputCurrency] || controllers[ogInputNumber];

					// Push an operation onto the stack
					scope.push = (operand, operator) => {
						// Push the operand on the stack
						if (0 === scope.stack.length) {
							scope.stack.push({operand});

							// Show the popover
							$timeout(() => angular.element(iElement)[0].dispatchEvent(new Event("showCalculator")));
						} else {
							scope.stack[scope.stack.length - 1].operand = operand;
						}

						// Push the operator onto the stack
						scope.stack.push({operator});

						// Update the display expression
						$timeout(() => (scope.expression = `\n${operator} ${scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(operand))) + (" " === scope.expression ? "" : scope.expression)}`));
					};

					// Perform the calculation
					scope.calculate = value => {
						// Default the result to the current view value
						scope.result = Number(scope.ogInput.formattedToRaw(value));

						// Make the current view value available on the scope
						scope.current = scope.ogInput.rawToFormatted(String(scope.result));

						if (scope.stack && scope.stack.length > 1) {
							scope.result = scope.stack.reduce((memo, operation, index) => {
								let result = memo;

								// First time through, extract the operand from the memo
								if (1 === index) {
									result = memo.operand;
								}

								// Last time through, use the view value for the operand
								if (index === scope.stack.length - 1) {
									operation.operand = scope.ogInput.formattedToRaw(value);
								}

								switch (operation.operator) {
									case "+":
										result += operation.operand;
										break;

									case "-":
										result -= operation.operand;
										break;

									case "*":
										result *= operation.operand;
										break;

									case "/":
										result /= operation.operand;
										break;

									// no default
								}

								return result;
							});
						}

						scope.formattedResult = scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(scope.result)));
					};

					// Handle input value changes
					scope.inputChanged = value => {
						// Matches any number of digits, periods or commas, followed by +, -, * or /
						const	matches = (/([\-\d\.,]+)([\+\-\*\/])(.*)/gi).exec(value),
									operand = 1,
									operator = 2,
									residual = 3;

						if (matches) {
							// Push the first (operand) and second (operator) matches onto the stack
							scope.push(Number(matches[operand]), matches[operator]);

							// Update the view value to the third match (anything after the operator), which is typically an empty string
							iElement.val(matches[residual]);
						} else {
							// Recalculate
							scope.calculate(value);
						}

						// Return the current result
						return String(scope.result);
					};

					// View to model
					ngModel.$parsers.push(scope.inputChanged);

					// Update the input value and hide the calculator
					scope.update = () => {
						// Reset the stack
						scope.clear();

						// Set the value
						iElement.val(scope.result);

						// Hide the popover
						scope.close();
					};

					// Cancel the calculation and hide the calculator
					scope.cancel = () => {
						scope.clear();
						scope.close();
					};

					// Clear the stack
					scope.clear = () => {
						scope.stack = [];
						scope.expression = " ";
					};

					// Close the popover
					scope.close = () => {
						$timeout(() => angular.element(iElement)[0].dispatchEvent(new Event("hideCalculator")));
					};

					// Start with a cleared calculator
					scope.clear();

					function keyHandler(event) {
						scope.keyHandler(event);
					}

					function update() {
						if (scope.stack.length > 0) {
							scope.update();
						}
					}

					// Declare key handler to detect operators and actions
					scope.keyHandler = event => {
						// Check if the key pressed was an action key, and there is a pending calculation
						// (otherwise, let the event propagate)
						if (!event.shiftKey && Reflect.getOwnPropertyDescriptor(ACTION_KEYS, event.keyCode) && scope.stack.length > 0) {
							// Invoke the action
							ACTION_KEYS[event.keyCode]();

							// Select the new input value
							$timeout(() => $(iElement).select());

							// Swallow the event
							event.preventDefault();
							event.stopPropagation();
						}
					};

					iElement.on("keydown", keyHandler);
					iElement.on("blur", update);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", () => {
						iElement.off("keydown", keyHandler);
						iElement.off("blur", update);
					});
				}
			};
		}

		static factory($timeout) {
			return new OgInputCalculatorDirective($timeout);
		}
	}

	/**
	 * Registration
	 */
	const mod = angular.module("ogComponents");

	// Declare the ogInputCalculator directive
	mod.directive("ogInputCalculator", OgInputCalculatorDirective.factory);

	/**
	 * Dependencies
	 */
	OgInputCalculatorDirective.factory.$inject = ["$timeout"];
}
