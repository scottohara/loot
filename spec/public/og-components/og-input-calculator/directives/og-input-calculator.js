(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputCalculator", function() {
		// The object under test
		var ogInputCalculator;

		// Dependencies
		var $tooltipProvider,
				$timeout;

		// Load the modules
		beforeEach(module("lootMocks", "ui.bootstrap", function(_$tooltipProvider_) {
			$tooltipProvider = _$tooltipProvider_;
			sinon.stub($tooltipProvider, "setTriggers");
		}));

		beforeEach(module("ogComponents"));

		// Load the template
		beforeEach(module("og-components/og-input-calculator/views/calculator.html"));

		// Configure & compile the object under test
		beforeEach(inject(function(_$timeout_, ogInputCurrencyControllerMock, ogInputNumberControllerMock, ogInputCurrencyDirective, ogInputNumberDirective, directiveTest) {
			$timeout = _$timeout_;

			// Swap the input currency/number directive controllers with the mock versions
			ogInputCurrencyDirective[0].controller = ogInputCurrencyControllerMock;
			ogInputNumberDirective[0].controller = ogInputNumberControllerMock;

			ogInputCalculator = directiveTest;
			ogInputCalculator.configure("og-input-calculator", "input");
			ogInputCalculator.compile({"og-input-currency": ""}, true);
			ogInputCalculator.scope.$digest();
			ogInputCalculator.element = ogInputCalculator.element.find("input");
		}));

		it("should add a custom trigger to the $tooltipProvider for the calculator", function() {
			$tooltipProvider.setTriggers.should.have.been.calledWith({"showCalculator": "hideCalculator"});
		});

		it("should default the position to left if unspecified", function() {
			ogInputCalculator.scope.position.should.equal("left");
		});

		it("should set the position if specified", function() {
			ogInputCalculator.compile({"og-input-calculator": "right"}, true);
			ogInputCalculator.scope.$digest();
			ogInputCalculator.scope.position.should.equal("right");
		});

		describe("(formatting)", function() {
			it("should use currency formatting if the element includes an og-input-currency directive", function() {
				ogInputCalculator.scope.ogInput.type.should.equal("ogInputCurrencyController");
			});

			it("should use number formatting if the element includes an og-input-number directive", function() {
				ogInputCalculator.compile({"og-input-number": ""});
				ogInputCalculator.scope.$digest();
				ogInputCalculator.scope.ogInput.type.should.equal("ogInputNumberController");
			});

			it("should throw an error if the element includes both og-input-currency and og-input-number directives", function() {
				ogInputCalculator.compile.bind(ogInputCalculator, {"og-input-currency": "", "og-input-number": ""}).should.throw("[$compile:multidir]");
			});

			it("should use no formatting if the element includes neither og-input-currency or og-input-number directives", function() {
				ogInputCalculator.compile(undefined);
				ogInputCalculator.scope.$digest();
				(null === ogInputCalculator.scope.ogInput).should.be.true;
			});
		});

		describe("push", function() {
			describe("(initial value)", function() {
				var mockAngularElement,
						realAngularElement;

				beforeEach(function() {
					mockAngularElement = {
						triggerHandler: sinon.stub()
					};

					realAngularElement = angular.element;
					angular.element = sinon.stub();
					angular.element.withArgs(sinon.match(function(value) {
						return value[0] === ogInputCalculator.element[0];
					})).returns(mockAngularElement);

					ogInputCalculator.scope.push(1, "+");
					$timeout.flush();
					ogInputCalculator.scope.stack.length.should.equal(2);
				});

				it("should push the operand onto the stack", function() {
					ogInputCalculator.scope.stack[0].should.deep.equal({operand: 1});
				});

				it("should show the popover", function() {
					mockAngularElement.triggerHandler.should.have.been.calledWith("showCalculator");
				});

				it("should set operator and operand as the display expression", function() {
					ogInputCalculator.scope.expression.should.equal("\n+ 1");
				});

				afterEach(function() {
					angular.element = realAngularElement;
				});
			});

			describe("(subsequent value)", function() {
				beforeEach(function() {
					ogInputCalculator.scope.stack = [{operand: 2}, {operator: "*"}];
					ogInputCalculator.scope.expression = "\n* 2";
					ogInputCalculator.scope.push(1, "+");
					$timeout.flush();
					ogInputCalculator.scope.stack.length.should.equal(3);
				});

				it("should set the operand on the last entry on the stack", function() {
					ogInputCalculator.scope.stack[1].should.deep.equal({operator: "*", operand: 1});
				});

				it("should prepend operator and operand to the display expression", function() {
					ogInputCalculator.scope.expression.should.equal("\n+ 1\n* 2");
				});
			});

			it("should push the operator onto the stack", function() {
				ogInputCalculator.scope.push(1, "+");
				$timeout.flush();
				ogInputCalculator.scope.stack.pop().should.deep.equal({operator: "+"});
			});

			afterEach(function() {
				$timeout.verifyNoPendingTasks();
			});
		});

		describe("calculate", function() {
			it("should set the passed value on the scope", function() {
				ogInputCalculator.scope.calculate("1");
				ogInputCalculator.scope.current.should.equal("1");
			});

			describe("(stack is undefined)", function() {
				it("should set the result to the input value", function() {
					ogInputCalculator.scope.stack = undefined;
					ogInputCalculator.scope.calculate("1");
					ogInputCalculator.scope.result.should.equal(1);
				});
			});

			describe("(stack is empty)", function() {
				it("should set the result to the input value", function() {
					ogInputCalculator.scope.stack = [];
					ogInputCalculator.scope.calculate("1");
					ogInputCalculator.scope.result.should.equal(1);
				});
			});

			describe("(stack contains a single entry)", function() {
				it("should set the result to the input value", function() {
					ogInputCalculator.scope.stack = [1];
					ogInputCalculator.scope.calculate("1");
					ogInputCalculator.scope.result.should.equal(1);
				});
			});

			describe("(stack contains more than one entry)", function() {
				beforeEach(function() {
					ogInputCalculator.scope.stack = [
						{operand: 5},
						{operator: "+", operand: 4},
						{operator: "-", operand: 3},
						{operator: "*", operand: 2},
						{operator: "/"}
					];
					ogInputCalculator.scope.calculate("1");
				});

				it("should calculate the result", function() {
					ogInputCalculator.scope.result.should.equal(12);
				});

				it("should set the formatted result on the scope", function() {
					ogInputCalculator.scope.formattedResult.should.equal("12");
				});
			});
		});

		describe("inputChanged", function() {
			beforeEach(function() {
				sinon.stub(ogInputCalculator.scope, "push");
				sinon.stub(ogInputCalculator.scope, "calculate");
			});
				
			describe("(value contains an operator)", function() {
				var scenarios = [
					{
						input: "1+",
						operand: 1,
						operator: "+",
						residual: ""
					},
					{
						input: "1-",
						operand: 1,
						operator: "-",
						residual: ""
					},
					{
						input: "1*",
						operand: 1,
						operator: "*",
						residual: ""
					},
					{
						input: "1/",
						operand: 1,
						operator: "/",
						residual: ""
					},
					{
						input: "1+2",
						operand: 1,
						operator: "+",
						residual: "2"
					},
					{
						input: "-1+",
						operand: -1,
						operator: "+",
						residual: ""
					},
					{
						input: "-1-2",
						operand: -1,
						operator: "-",
						residual: "2"
					},
					{
						input: "abc-1+abc2abc",
						operand: -1,
						operator: "+",
						residual: "abc2abc"
					},
					{
						input: "1+2+3",
						operand: 1,
						operator: "+",
						residual: "2+3"
					}
				];

				scenarios.forEach(function(scenario) {
					it("should push the operand " + scenario.operand + " and operator '" + scenario.operator + "' onto the stack when the input is '" + scenario.input + "'", function() {
						ogInputCalculator.scope.inputChanged(scenario.input);
						ogInputCalculator.scope.push.should.have.been.calledWith(scenario.operand, scenario.operator);
					});

					it("should set the view value to '" + scenario.residual + "' when then input is '" + scenario.input + "'", function() {
						ogInputCalculator.scope.inputChanged(scenario.input);
						ogInputCalculator.element.val().should.equal(scenario.residual);
					});
				});
			});

			describe("(value doesn't contain an operator)", function() {
				beforeEach(function() {
					ogInputCalculator.scope.inputChanged("1");
				});
				
				it("should recalculate the result", function() {
					ogInputCalculator.scope.calculate.should.have.been.calledWith("1");
				});
			});

			it("should return the current result", function() {
				ogInputCalculator.scope.inputChanged("1+2");
				ogInputCalculator.scope.result = 3;
				ogInputCalculator.scope.inputChanged().should.equal("3");
			});
		});

		describe("update", function() {
			beforeEach(function() {
				sinon.stub(ogInputCalculator.scope, "clear");
				sinon.stub(ogInputCalculator.scope, "close");
				ogInputCalculator.scope.result = 1;
				ogInputCalculator.scope.update();
				ogInputCalculator.scope.$digest();
			});

			it("should reset the stack", function() {
				ogInputCalculator.scope.clear.should.have.been.called;
			});

			it("should update the input value and view value", function() {
				ogInputCalculator.element.val().should.equal("1");
			});

			it("should close the calculator", function() {
				ogInputCalculator.scope.close.should.have.been.called;
			});
		});

		describe("cancel", function() {
			beforeEach(function() {
				sinon.stub(ogInputCalculator.scope, "clear");
				sinon.stub(ogInputCalculator.scope, "close");
				ogInputCalculator.scope.cancel();
			});

			it("should clear the calculator", function() {
				ogInputCalculator.scope.clear.should.have.been.called;
			});

			it("should close the calculator", function() {
				ogInputCalculator.scope.close.should.have.been.called;
			});
		});

		describe("clear", function() {
			beforeEach(function() {
				ogInputCalculator.scope.stack = [1,2,3];
				ogInputCalculator.scope.expression = "test expression";
				ogInputCalculator.scope.clear();
			});

			it("should reset the stack to an empty array", function() {
				ogInputCalculator.scope.stack.should.be.an.Array;
				ogInputCalculator.scope.stack.should.be.empty;
			});

			it("should reset the expression", function() {
				ogInputCalculator.scope.expression.should.equal(" ");
			});
		});

		describe("close", function() {
			var mockAngularElement,
					realAngularElement;

			beforeEach(function() {
				mockAngularElement = {
					triggerHandler: sinon.stub()
				};

				realAngularElement = angular.element;
				angular.element = sinon.stub();
				angular.element.withArgs(sinon.match(function(value) {
					return value[0] === ogInputCalculator.element[0];
				})).returns(mockAngularElement);

				ogInputCalculator.scope.close();
				$timeout.flush();
			});

			it("should hide the popover", function() {
				mockAngularElement.triggerHandler.should.have.been.called;
			});

			afterEach(function() {
				angular.element = realAngularElement;
			});
		});

		it("should start with a cleared calculator", function() {
			ogInputCalculator.scope.stack.should.be.an.Array;
			ogInputCalculator.scope.stack.should.be.empty;
			ogInputCalculator.scope.expression.should.equal(" ");
		});

		describe("keyhandler", function() {
			var TEST_ACTION_KEYS = [
				{code: 13, name: "Enter", handler: "update"},
				{code: 27, name: "Esc", handler: "cancel"},
				{code: 187, name: "Equals", handler: "update"}
			];

			var event,
					mockJQueryInstance,
					realJQueryInstance,
					actionHandler;

			beforeEach(function() {
				event = {
					keyCode: 189,
					preventDefault: sinon.stub(),
					stopPropagation: sinon.stub()
				};
				ogInputCalculator.scope.model = 1;
				ogInputCalculator.scope.$digest();
				ogInputCalculator.element.val().should.equal("1");

				mockJQueryInstance = {
					select: sinon.stub()
				};

				realJQueryInstance = window.$;
				window.$ = sinon.stub();
				window.$.withArgs(sinon.match(function(value) {
					return value[0] === ogInputCalculator.element[0];
				})).returns(mockJQueryInstance);
			});

			TEST_ACTION_KEYS.forEach(function(key) {
				it("should do nothing when the SHIFT+" + key.name + " keys are pressed", function() {
					event.keyCode = key.code;
					event.shiftKey = true;
					ogInputCalculator.scope.stack = [1];
					actionHandler = sinon.stub(ogInputCalculator.scope, key.handler);
					ogInputCalculator.scope.keyHandler(event);
					$timeout.flush();
					actionHandler.should.not.have.been.called;
					mockJQueryInstance.select.should.not.have.been.called;
					event.stopPropagation.should.not.have.been.called;
				});

				it("should do nothing when the " + key.name + " key is pressed and the stack is empty", function() {
					event.keyCode = key.code;
					actionHandler = sinon.stub(ogInputCalculator.scope, key.handler);
					ogInputCalculator.scope.keyHandler(event);
					$timeout.flush();
					actionHandler.should.not.have.been.called;
					mockJQueryInstance.select.should.not.have.been.called;
					event.preventDefault.should.not.have.been.called;
					event.stopPropagation.should.not.have.been.called;
				});

				it("should invoke the " + key.handler + " handler when the " + key.name + " key is pressed", function() {
					event.keyCode = key.code;
					ogInputCalculator.scope.stack = [1];
					actionHandler = sinon.stub(ogInputCalculator.scope, key.handler);
					ogInputCalculator.scope.keyHandler(event);
					$timeout.flush();
					actionHandler.should.have.been.called;
					mockJQueryInstance.select.should.have.been.called;
					event.preventDefault.should.have.been.called;
					event.stopPropagation.should.have.been.called;
				});
			});

			afterEach(function() {
				window.$ = realJQueryInstance;
			});
		});

		describe("on keydown", function() {
			it("should invoke the keydown handler", function() {
				sinon.stub(ogInputCalculator.scope, "keyHandler");
				ogInputCalculator.element.triggerHandler("keydown");
				ogInputCalculator.scope.keyHandler.should.have.been.called;
			});
		});

		describe("on blur", function() {
			beforeEach(function() {
				sinon.stub(ogInputCalculator.scope, "update");
			});

			it("should do nothing if the stack is empty", function() {
				ogInputCalculator.element.triggerHandler("blur");
				ogInputCalculator.scope.update.should.not.have.been.called;
			});

			it("should invoke the blur handler", function() {
				ogInputCalculator.scope.stack = [1];
				ogInputCalculator.element.triggerHandler("blur");
				ogInputCalculator.scope.update.should.have.been.called;
			});
		});

		describe("on destroy", function() {
			beforeEach(function() {
				sinon.stub(ogInputCalculator.scope, "keyHandler");
				sinon.stub(ogInputCalculator.scope, "update");
				ogInputCalculator.element.triggerHandler("$destroy");
			});

			it("should remove the keydown handler from the element", function() {
				ogInputCalculator.element.triggerHandler("keydown");
				ogInputCalculator.scope.keyHandler.should.not.have.been.called;
			});

			it("should remove the blur handler from the element", function() {
				ogInputCalculator.element.triggerHandler("blur");
				ogInputCalculator.scope.update.should.not.have.been.called;
			});
		});
	});
})();
