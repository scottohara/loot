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
					scope.ngModel = controllers[0];
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
					scope.calculate = function() {
						scope.result = 0;

						// Make the current view value available on the scope
						scope.current = scope.ogInput.rawToFormatted(scope.ogInput.formattedToRaw(scope.ngModel.$viewValue));

						if (scope.stack && scope.stack.length > 1) {
							scope.result = scope.stack.reduce(function(memo, operation, index) {
								// First time through, extract the operand from the memo
								if (index === 1) {
									memo = memo.operand;
								}

								// Last time through, use the view value for the operand
								if (index === scope.stack.length - 1) {
									operation.operand = scope.ogInput.formattedToRaw(scope.ngModel.$viewValue);
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

					// (The handlers is wrapped in a function to aid with unit testing)
					scope.ngModel.$viewChangeListeners.unshift(function() {
						scope.calculate();
					});

					// Update the input value and hide the calculator
					scope.update = function() {
						// Reset the stack
						scope.clear();

						// Set the value
						iElement.val(scope.result);
						scope.ngModel.$setViewValue(String(scope.result));

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

					var OPERATOR_KEYS = {
						106: "*",	// Multiply (numpad)
						107: "+",	// Add (numpad)
						109: "-",	// Subtract (numpad)
						111: "/",	// Divide (numpad)
						189: "-",	// Subtract
						191: "/"	// Divide
					};

					var SHIFT_OPERATOR_KEYS = {
						56: "*",	// Multiply
						187: "+"	// Add
					};

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
						// Check if the key pressed was an operator key
						// (only if the input value is not empty - user could be trying to enter a negative number, eg. "-123.45")
						if (!scope.ngModel.$isEmpty(scope.ngModel.$viewValue) && OPERATOR_KEYS.hasOwnProperty(event.keyCode) || (event.shiftKey && SHIFT_OPERATOR_KEYS.hasOwnProperty(event.keyCode))) {
							// Push the current input value plus the operator key onto the stack
							scope.push(Number(scope.ngModel.$viewValue), (OPERATOR_KEYS[event.keyCode] || SHIFT_OPERATOR_KEYS[event.keyCode]));

							// Clear the input value
							iElement.val("");
							scope.ngModel.$setViewValue("");

							event.preventDefault();
						}

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
