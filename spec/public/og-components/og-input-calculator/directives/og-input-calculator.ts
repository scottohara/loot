import {
	DirectiveTestScope,
	JQueryKeyEventObjectMock
} from "mocks/types";
import {
	OgInputCalculatorOperation,
	OgInputCalculatorOperator,
	OgInputCalculatorScope
} from "og-components/og-input-calculator/types";
import {
	OgInputCurrencyControllerMock,
	OgInputCurrencyControllerType
} from "mocks/og-components/og-input-currency/types";
import {
	OgInputNumberControllerMock,
	OgInputNumberControllerType
} from "mocks/og-components/og-input-number/types";
import sinon, {SinonStub} from "sinon";
import DirectiveTest from "mocks/loot/directivetest";
import {ITooltipProvider} from "angular-ui-bootstrap";
import OgInputCurrencyDirective from "og-components/og-input-currency/directives/og-input-currency";
import OgInputNumberDirective from "og-components/og-input-number/directives/og-input-number";
import angular from "angular";

describe("ogInputCalculator", (): void => {
	let	ogInputCalculator: DirectiveTest,
			$uibTooltipProvider: ITooltipProvider,
			$window: angular.IWindowService,
			$timeout: angular.ITimeoutService,
			scope: OgInputCalculatorScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ui.bootstrap", (_$uibTooltipProvider_: ITooltipProvider): void => {
		$uibTooltipProvider = _$uibTooltipProvider_;
		sinon.stub($uibTooltipProvider, "setTriggers");
	}));

	beforeEach(angular.mock.module("ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, _$timeout_: angular.ITimeoutService, ogInputCurrencyControllerMock: OgInputCurrencyControllerMock, ogInputNumberControllerMock: OgInputNumberControllerMock, ogInputCurrencyDirective: OgInputCurrencyDirective[], ogInputNumberDirective: OgInputNumberDirective[], directiveTest: DirectiveTest): void => {
		$window = _$window_;
		$timeout = _$timeout_;

		// Swap the input currency/number directive controllers with the mock versions
		(ogInputCurrencyDirective[0] as angular.IDirective).controller = ogInputCurrencyControllerMock;
		(ogInputNumberDirective[0] as angular.IDirective).controller = ogInputNumberControllerMock;

		ogInputCalculator = directiveTest;
		ogInputCalculator.configure("og-input-calculator", "input");
		ogInputCalculator.compile({"og-input-currency": ""}, true);
		ogInputCalculator.scope.$digest();
		ogInputCalculator["element"] = ogInputCalculator["element"].find("input");
		scope = ogInputCalculator.scope as OgInputCalculatorScope;
	}));

	it("should default the position to left if unspecified", (): Chai.Assertion => scope.position.should.equal("left"));

	it("should set the position if specified", (): void => {
		ogInputCalculator.compile({"og-input-calculator": "right"}, true);
		scope.$digest();
		scope.position.should.equal("right");
	});

	describe("(formatting)", (): void => {
		it("should use currency formatting if the element includes an og-input-currency directive", (): Chai.Assertion => (scope.ogInput as OgInputCurrencyControllerType).type.should.equal("ogInputCurrencyController"));

		it("should use number formatting if the element includes an og-input-number directive", (): void => {
			ogInputCalculator.compile({"og-input-number": ""});
			scope.$digest();
			(scope.ogInput as OgInputNumberControllerType).type.should.equal("ogInputNumberController");
		});

		it("should throw an error if the element includes both og-input-currency and og-input-number directives", (): Chai.Assertion => ogInputCalculator.compile.bind(ogInputCalculator, {"og-input-currency": "", "og-input-number": ""}).should.throw("[$compile:multidir]"));

		it("should use no formatting if the element includes neither og-input-currency or og-input-number directives", (): void => {
			ogInputCalculator.compile({});
			scope.$digest();
			(null === scope.ogInput).should.be.true;
		});
	});

	describe("push", (): void => {
		describe("(initial value)", (): void => {
			let	mockAngularElement: {dispatchEvent: SinonStub;}[],
					realAngularElement: JQueryStatic<HTMLElement>;

			beforeEach((): void => {
				mockAngularElement = [{
					dispatchEvent: sinon.stub()
				}];

				realAngularElement = angular.element;
				sinon.stub(angular, "element").withArgs(sinon.match((value: JQuery<Element>): boolean => value[0] === ogInputCalculator["element"][0])).returns(mockAngularElement);

				scope.push(1, "+");
				$timeout.flush();
				scope.stack.length.should.equal(2);
			});

			it("should push the operand onto the stack", (): Chai.Assertion => scope.stack[0].should.deep.equal({operand: 1}));

			it("should show the popover", (): Chai.Assertion => mockAngularElement[0].dispatchEvent.should.have.been.calledWith(sinon.match((event: Event): boolean => "showCalculator" === event.type)));

			it("should set operator and operand as the display expression", (): Chai.Assertion => scope.expression.should.equal("\n+ 1"));

			afterEach((): JQueryStatic<HTMLElement> => (angular.element = realAngularElement));
		});

		describe("(subsequent value)", (): void => {
			beforeEach((): void => {
				scope.stack = [{operand: 2}, {operator: "*"}];
				scope.expression = "\n* 2";
				scope.push(1, "+");
				$timeout.flush();
				scope.stack.length.should.equal(3);
			});

			it("should set the operand on the last entry on the stack", (): Chai.Assertion => scope.stack[1].should.deep.equal({operator: "*", operand: 1}));

			it("should prepend operator and operand to the display expression", (): Chai.Assertion => scope.expression.should.equal("\n+ 1\n* 2"));
		});

		it("should push the operator onto the stack", (): void => {
			scope.push(1, "+");
			$timeout.flush();
			(scope.stack.pop() as OgInputCalculatorOperation).should.deep.equal({operator: "+"});
		});

		afterEach((): void => $timeout.verifyNoPendingTasks());
	});

	describe("calculate", (): void => {
		it("should set the passed value on the scope", (): void => {
			scope.calculate("1");
			scope.current.should.equal("1");
		});

		describe("(stack is empty)", (): void => {
			it("should set the result to the input value", (): void => {
				scope.stack = [];
				scope.calculate("1");
				scope.result.should.equal(1);
			});
		});

		describe("(stack contains a single entry)", (): void => {
			it("should set the result to the input value", (): void => {
				scope.stack = [{operand: 1}];
				scope.calculate("1");
				scope.result.should.equal(1);
			});
		});

		describe("(stack contains more than one entry)", (): void => {
			beforeEach((): void => {
				scope.stack = [
					{operand: 5},
					{operator: "+", operand: 4},
					{operator: "-", operand: 3},
					{operator: "*", operand: 2},
					{operator: "/"}
				];
				scope.calculate("1");
			});

			it("should calculate the result", (): Chai.Assertion => scope.result.should.equal(12));

			it("should set the formatted result on the scope", (): Chai.Assertion => scope.formattedResult.should.equal("12"));
		});
	});

	describe("inputChanged", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "push");
			sinon.stub(scope, "calculate");
		});

		describe("(value contains an operator)", (): void => {
			const scenarios: {input: string; operand: number; operator: OgInputCalculatorOperator; residual: string;}[] = [
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

			scenarios.forEach((scenario: {input: string; operand: number; operator: OgInputCalculatorOperator; residual: string;}): void => {
				it(`should push the operand ${scenario.operand} and operator '${scenario.operator}' onto the stack when the input is '${scenario.input}'`, (): void => {
					scope.inputChanged(scenario.input);
					scope.push.should.have.been.calledWith(scenario.operand, scenario.operator);
				});

				it(`should set the view value to '${scenario.residual}' when then input is '${scenario.input}'`, (): void => {
					scope.inputChanged(scenario.input);
					(ogInputCalculator["element"].val() as string).should.equal(scenario.residual);
				});
			});
		});

		describe("(value doesn't contain an operator)", (): void => {
			beforeEach((): string => scope.inputChanged("1"));

			it("should recalculate the result", (): Chai.Assertion => scope.calculate.should.have.been.calledWith("1"));
		});

		it("should return the current result", (): void => {
			scope.inputChanged("1+2");
			scope.result = 3;
			scope.inputChanged("").should.equal("3");
		});
	});

	describe("update", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "clear");
			sinon.stub(scope, "close");
			scope.result = 1;
			scope.update();
			scope.$digest();
		});

		it("should reset the stack", (): Chai.Assertion => scope.clear.should.have.been.called);

		it("should update the input value and view value", (): Chai.Assertion => (ogInputCalculator["element"].val() as string).should.equal("1"));

		it("should close the calculator", (): Chai.Assertion => scope.close.should.have.been.called);
	});

	describe("cancel", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "clear");
			sinon.stub(scope, "close");
			scope.cancel();
		});

		it("should clear the calculator", (): Chai.Assertion => scope.clear.should.have.been.called);

		it("should close the calculator", (): Chai.Assertion => scope.close.should.have.been.called);
	});

	describe("clear", (): void => {
		beforeEach((): void => {
			scope.stack = [
				{operand: 1},
				{operand: 2},
				{operand: 3}
			];
			scope.expression = "test expression";
			scope.clear();
		});

		it("should reset the stack to an empty array", (): void => {
			scope.stack.should.be.an("array");
			scope.stack.should.be.empty;
		});

		it("should reset the expression", (): Chai.Assertion => scope.expression.should.equal(" "));
	});

	describe("close", (): void => {
		let	mockAngularElement: {dispatchEvent: SinonStub;}[],
				realAngularElement: JQueryStatic<HTMLElement>;

		beforeEach((): void => {
			mockAngularElement = [{
				dispatchEvent: sinon.stub()
			}];

			realAngularElement = angular.element;
			sinon.stub(angular, "element").withArgs(sinon.match((value: JQuery<Element>): boolean => value[0] === ogInputCalculator["element"][0])).returns(mockAngularElement);

			scope.close();
			$timeout.flush();
		});

		it("should hide the popover", (): Chai.Assertion => mockAngularElement[0].dispatchEvent.should.have.been.calledWith(sinon.match((event: Event): boolean => "hideCalculator" === event.type)));

		afterEach((): JQueryStatic<HTMLElement> => (angular.element = realAngularElement));
	});

	it("should start with a cleared calculator", (): void => {
		scope.stack.should.be.an("array");
		scope.stack.should.be.empty;
		scope.expression.should.equal(" ");
	});

	describe("keyhandler", (): void => {
		const TEST_ACTION_KEYS: {code: number; name: string; handler: string;}[] = [
			{code: 13, name: "Enter", handler: "update"},
			{code: 27, name: "Esc", handler: "cancel"},
			{code: 187, name: "Equals", handler: "update"}
		];

		let	event: JQueryKeyEventObjectMock,
				mockJQueryInstance: {select: SinonStub;},
				realJQueryInstance: JQuery,
				actionHandler: () => void;

		beforeEach((): void => {
			event = {
				keyCode: 189,
				preventDefault: sinon.stub(),
				stopPropagation: sinon.stub()
			};
			(scope as DirectiveTestScope).model = 1;
			scope.$digest();
			(ogInputCalculator["element"].val() as string).should.equal("1");

			mockJQueryInstance = {
				select: sinon.stub()
			};

			realJQueryInstance = $window.$;
			$window.$ = sinon.stub();
			$window.$.withArgs(sinon.match((value: JQuery<Element>): boolean => value[0] === ogInputCalculator["element"][0])).returns(mockJQueryInstance);
		});

		TEST_ACTION_KEYS.forEach((key: {code: number; name: string; handler: string;}): void => {
			it(`should do nothing when the SHIFT+${key.name} keys are pressed`, (): void => {
				event.keyCode = key.code;
				event.shiftKey = true;
				scope.stack = [{operand: 1}];
				actionHandler = sinon.stub(scope, key.handler as keyof OgInputCalculatorScope);
				scope.keyHandler(event as JQueryKeyEventObject);
				$timeout.flush();
				actionHandler.should.not.have.been.called;
				mockJQueryInstance.select.should.not.have.been.called;
				(event.stopPropagation as SinonStub).should.not.have.been.called;
			});

			it(`should do nothing when the ${key.name} key is pressed and the stack is empty`, (): void => {
				event.keyCode = key.code;
				actionHandler = sinon.stub(scope, key.handler as keyof OgInputCalculatorScope);
				scope.keyHandler(event as JQueryKeyEventObject);
				$timeout.flush();
				actionHandler.should.not.have.been.called;
				mockJQueryInstance.select.should.not.have.been.called;
				(event.preventDefault as SinonStub).should.not.have.been.called;
				(event.stopPropagation as SinonStub).should.not.have.been.called;
			});

			it(`should invoke the ${key.handler} handler when the ${key.name} key is pressed`, (): void => {
				event.keyCode = key.code;
				scope.stack = [{operand: 1}];
				actionHandler = sinon.stub(scope, key.handler as keyof OgInputCalculatorScope);
				scope.keyHandler(event as JQueryKeyEventObject);
				$timeout.flush();
				actionHandler.should.have.been.called;
				mockJQueryInstance.select.should.have.been.called;
				(event.preventDefault as SinonStub).should.have.been.called;
				(event.stopPropagation as SinonStub).should.have.been.called;
			});
		});

		afterEach((): JQuery => ($window.$ = realJQueryInstance));
	});

	describe("on keydown", (): void => {
		it("should invoke the keydown handler", (): void => {
			sinon.stub(scope, "keyHandler");
			ogInputCalculator["element"].triggerHandler("keydown");
			scope.keyHandler.should.have.been.called;
		});
	});

	describe("on blur", (): void => {
		beforeEach((): SinonStub => sinon.stub(scope, "update"));

		it("should do nothing if the stack is empty", (): void => {
			ogInputCalculator["element"].triggerHandler("blur");
			scope.update.should.not.have.been.called;
		});

		it("should invoke the blur handler", (): void => {
			scope.stack = [{operand: 1}];
			ogInputCalculator["element"].triggerHandler("blur");
			scope.update.should.have.been.called;
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "keyHandler");
			sinon.stub(scope, "update");
			ogInputCalculator["element"].triggerHandler("$destroy");
		});

		it("should remove the keydown handler from the element", (): void => {
			ogInputCalculator["element"].triggerHandler("keydown");
			scope.keyHandler.should.not.have.been.called;
		});

		it("should remove the blur handler from the element", (): void => {
			ogInputCalculator["element"].triggerHandler("blur");
			scope.update.should.not.have.been.called;
		});
	});
});
