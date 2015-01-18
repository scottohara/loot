(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Add a custom trigger to the $tooltipProvider for the calculator
	mod.config(["$tooltipProvider",
		function($tooltipProvider) {
			$tooltipProvider.setTriggers({"showCalculator": "hideCalculator"});
		}
	]);

	// Declare the ogInputCalculator directive
	mod.directive("ogInputCalculator", ["$timeout",
		function($timeout) {
			return {
				restrict: "A",
				require: ["ngModel", "?ogInputCurrency", "?ogInputNumber"],
				replace: true,
				templateUrl: "og-components/og-input-calculator/views/calculator.html",
				link: function(scope, iElement, iAttrs, controllers) {
					// Get the position of the popover, or default to left if unspecified
					scope.position = iAttrs.ogInputCalculator || "left";

					// Get the controllers
					var ngModel = controllers[0];
					scope.ogInput = controllers[1] || controllers[2];

					// Push an operation onto the stack
					scope.push = function(operand, operator) {
						// Push the operand on the stack
						if (0 === scope.stack.length) {
							scope.stack.push({operand: operand});

							// Show the popover
							$timeout(function() {
								angular.element(iElement).triggerHandler("showCalculator");
							}, 0);
						} else {
							scope.stack[scope.stack.length - 1].operand = operand;
						}

						// Push the operator onto the stack
						scope.stack.push({operator: operator});

						// Update the display expression
						$timeout(function() {
							scope.expression = "\n" + operator + " " + scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(operand))) + (" " === scope.expression ? "" : scope.expression);
						}, 0);
					};

					// Perform the calculation
					scope.calculate = function(value) {
						// Default the result to the current view value
						scope.result = Number(scope.ogInput.formattedToRaw(value));

						// Make the current view value available on the scope
						scope.current = scope.ogInput.rawToFormatted(String(scope.result));

						if (scope.stack && scope.stack.length > 1) {
							scope.result = scope.stack.reduce(function(memo, operation, index) {
								// First time through, extract the operand from the memo
								if (index === 1) {
									memo = memo.operand;
								}

								// Last time through, use the view value for the operand
								if (index === scope.stack.length - 1) {
									operation.operand = scope.ogInput.formattedToRaw(value);
								}

								switch (operation.operator) {
									case "+":
										memo += operation.operand;
										break;

									case "-":
										memo -= operation.operand;
										break;

									case "*":
										memo *= operation.operand;
										break;

									case "/":
										memo /= operation.operand;
										break;
								}

								return memo;
							});
						}

						scope.formattedResult = scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(String(scope.result)));
					};

					// Handle input value changes
					scope.inputChanged = function(value) {
						// Matches any number of digits, periods or commas, followed by +, -, * or /
						var matches = /([\-\d\.,]+)([\+\-\*\/])(.*)/gi.exec(value);

						if (matches) {
							// Push the first (operand) and second (operator) matches onto the stack
							scope.push(Number(matches[1]), matches[2]);

							// Update the view value to the third match (anything after the operator), which is typically an empty string
							iElement.val(matches[3]);
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
					scope.update = function() {
						// Reset the stack
						scope.clear();

						// Set the value
						iElement.val(scope.result);

						// Hide the popover
						scope.close();
					};

					// Cancel the calculation and hide the calculator
					scope.cancel = function() {
						scope.clear();
						scope.close();
					};

					// Clear the stack
					scope.clear = function() {
						scope.stack = [];
						scope.expression = " ";
					};

					// Close the popover
					scope.close = function() {
						$timeout(function() {
							angular.element(iElement).triggerHandler("hideCalculator");
						}, 0);
					};

					// Start with a cleared calculator
					scope.clear();

					// (The handlers are wrapped in functions to aid with unit testing)
					var ACTION_KEYS = {
						13: function() {	//Enter
							scope.update();
						},
						27: function() {	//Esc
							scope.cancel();
						},
						187: function() {	//Equals
							scope.update();
						}
					};

					// Declare key handler to detect operators and actions
					scope.keyHandler = function(event) {
						// Check if the key pressed was an action key, and there is a pending calculation
						// (otherwise, let the event propagate)
						if (!event.shiftKey && ACTION_KEYS.hasOwnProperty(event.keyCode) && scope.stack.length > 0) {
							// Invoke the action
							ACTION_KEYS[event.keyCode]();

							// Select the new input value
							$timeout(function() {
								$(iElement).select();
							});

							// Swallow the event
							event.preventDefault();
							event.stopPropagation();
						}
					};

					// Attach the event handlers
					// (The handlers are wrapped in functions to aid with unit testing)
					var keyHandler = function(event) {
						scope.keyHandler(event);
					};
					var update = function() {
						if (scope.stack.length > 0) {
							scope.update();
						}
					};

					iElement.on("keydown", keyHandler);
					iElement.on("blur", update);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", function() {
						iElement.off("keydown", keyHandler);
						iElement.off("blur", update);
					});
				}
			};
		}
	]);
})();
