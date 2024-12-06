import type {
	DirectiveTestScope,
	JQueryKeyEventObjectMock,
} from "~/mocks/types";
import type {
	OgInputCalculatorOperation,
	OgInputCalculatorOperator,
	OgInputCalculatorScope,
} from "~/og-components/og-input-calculator/types";
import sinon, { type SinonStub } from "sinon";
import type DirectiveTest from "~/mocks/loot/directivetest";
import type OgInputCurrencyController from "~/og-components/og-input-currency/controllers/currency";
import type { OgInputCurrencyControllerMock } from "~/mocks/og-components/og-input-currency/types";
import type OgInputCurrencyDirective from "~/og-components/og-input-currency/directives/og-input-currency";
import type OgInputNumberController from "~/og-components/og-input-number/controllers/number";
import type { OgInputNumberControllerMock } from "~/mocks/og-components/og-input-number/types";
import type OgInputNumberDirective from "~/og-components/og-input-number/directives/og-input-number";
import angular from "angular";

describe("ogInputCalculator", (): void => {
	let ogInputCalculator: DirectiveTest,
		$uibTooltipProvider: angular.ui.bootstrap.ITooltipProvider,
		$window: angular.IWindowService,
		$timeout: angular.ITimeoutService,
		scope: OgInputCalculatorScope;

	// Load the modules
	beforeEach(
		angular.mock.module(
			"lootMocks",
			"ui.bootstrap",
			(_$uibTooltipProvider_: angular.ui.bootstrap.ITooltipProvider): void => {
				$uibTooltipProvider = _$uibTooltipProvider_;
				sinon.stub($uibTooltipProvider, "setTriggers");
			},
		) as Mocha.HookFunction,
	);

	beforeEach(angular.mock.module("ogComponents") as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(
		angular.mock.inject(
			(
				_$window_: angular.IWindowService,
				_$timeout_: angular.ITimeoutService,
				ogInputCurrencyControllerMock: OgInputCurrencyControllerMock,
				ogInputNumberControllerMock: OgInputNumberControllerMock,
				ogInputCurrencyDirective: OgInputCurrencyDirective[],
				ogInputNumberDirective: OgInputNumberDirective[],
				directiveTest: DirectiveTest,
			): void => {
				$window = _$window_;
				$timeout = _$timeout_;

				// Swap the input currency/number directive controllers with the mock versions
				(ogInputCurrencyDirective[0] as angular.IDirective).controller =
					ogInputCurrencyControllerMock;
				(ogInputNumberDirective[0] as angular.IDirective).controller =
					ogInputNumberControllerMock;

				ogInputCalculator = directiveTest;
				ogInputCalculator.configure("og-input-calculator", "input");
				ogInputCalculator.compile({ "og-input-currency": undefined }, true);
				ogInputCalculator.scope.$digest();
				ogInputCalculator["element"] =
					ogInputCalculator["element"].find("input");
				scope = ogInputCalculator.scope as OgInputCalculatorScope;
			},
		) as Mocha.HookFunction,
	);

	it("should default the position to left if unspecified", (): Chai.Assertion =>
		expect(scope.position).to.equal("left"));

	it("should set the position if specified", (): void => {
		ogInputCalculator.compile({ "og-input-calculator": "right" }, true);
		scope.$digest();
		expect(scope.position).to.equal("right");
	});

	describe("(formatting)", (): void => {
		it("should use currency formatting if the element includes an og-input-currency directive", (): Chai.Assertion =>
			expect(
				(scope.ogInput as OgInputCurrencyController & { type: string }).type,
			).to.equal("ogInputCurrencyController"));

		it("should use number formatting if the element includes an og-input-number directive", (): void => {
			ogInputCalculator.compile({ "og-input-number": undefined });
			scope.$digest();
			expect(
				(scope.ogInput as OgInputNumberController & { type: string }).type,
			).to.equal("ogInputNumberController");
		});

		it("should throw an error if the element includes both og-input-currency and og-input-number directives", (): Chai.Assertion =>
			expect(
				ogInputCalculator.compile.bind(ogInputCalculator, {
					"og-input-currency": "",
					"og-input-number": "",
				}),
			).to.throw("[$compile:multidir]"));

		it("should use no formatting if the element includes neither og-input-currency or og-input-number directives", (): void => {
			ogInputCalculator.compile({});
			scope.$digest();
			expect(scope.ogInput as angular.IController | null).to.be.null;
		});
	});

	describe("push", (): void => {
		describe("(initial value)", (): void => {
			let mockAngularElement: { dispatchEvent: SinonStub }[],
				realAngularElement: JQueryStatic;

			beforeEach((): void => {
				mockAngularElement = [
					{
						dispatchEvent: sinon.stub(),
					},
				];

				realAngularElement = angular.element;
				(sinon.stub(angular, "element") as SinonStub)
					.withArgs(
						sinon.match(
							(value: JQuery<Element>): boolean =>
								value[0] === ogInputCalculator["element"][0],
						),
					)
					.returns(mockAngularElement);

				scope.push(1, "+");
				$timeout.flush();
				expect(scope.stack.length).to.equal(2);
			});

			it("should push the operand onto the stack", (): Chai.Assertion =>
				expect(scope.stack[0]).to.deep.equal({ operand: 1 }));

			it("should show the popover", (): Chai.Assertion =>
				expect(mockAngularElement[0].dispatchEvent).to.have.been.calledWith(
					sinon.match(
						(event: Event): boolean => "showCalculator" === event.type,
					),
				));

			it("should set operator and operand as the display expression", (): Chai.Assertion =>
				expect(scope.expression).to.equal("\n+ 1"));

			afterEach((): JQueryStatic => (angular.element = realAngularElement));
		});

		describe("(subsequent value)", (): void => {
			beforeEach((): void => {
				scope.stack = [{ operand: 2 }, { operator: "*" }];
				scope.expression = "\n* 2";
				scope.push(1, "+");
				$timeout.flush();
				expect(scope.stack.length).to.equal(3);
			});

			it("should set the operand on the last entry on the stack", (): Chai.Assertion =>
				expect(scope.stack[1]).to.deep.equal({ operator: "*", operand: 1 }));

			it("should prepend operator and operand to the display expression", (): Chai.Assertion =>
				expect(scope.expression).to.equal("\n+ 1\n* 2"));
		});

		it("should push the operator onto the stack", (): void => {
			scope.push(1, "+");
			$timeout.flush();
			expect(scope.stack.pop() as OgInputCalculatorOperation).to.deep.equal({
				operator: "+",
			});
		});

		afterEach((): void => $timeout.verifyNoPendingTasks());
	});

	describe("calculate", (): void => {
		it("should set the passed value on the scope", (): void => {
			scope.calculate("1");
			expect(scope.current).to.equal("1");
		});

		describe("(stack is empty)", (): void => {
			it("should set the result to the input value", (): void => {
				scope.stack = [];
				scope.calculate("1");
				expect(scope.result).to.equal(1);
			});
		});

		describe("(stack contains a single entry)", (): void => {
			it("should set the result to the input value", (): void => {
				scope.stack = [{ operand: 1 }];
				scope.calculate("1");
				expect(scope.result).to.equal(1);
			});
		});

		describe("(stack contains more than one entry)", (): void => {
			beforeEach((): void => {
				scope.stack = [
					{ operand: 5 },
					{ operator: "+", operand: 4 },
					{ operator: "-", operand: 3 },
					{ operator: "*", operand: 2 },
					{ operator: "/", operand: 1 },
					{ operator: undefined },
				];
				scope.calculate("1");
			});

			it("should calculate the result", (): Chai.Assertion =>
				expect(scope.result).to.equal(12));

			it("should set the formatted result on the scope", (): Chai.Assertion =>
				expect(scope.formattedResult).to.equal("12"));
		});
	});

	describe("inputChanged", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "push");
			sinon.stub(scope, "calculate");
		});

		describe("(value contains an operator)", (): void => {
			const scenarios: {
				input: string;
				operand: number;
				operator: OgInputCalculatorOperator;
				residual: string;
			}[] = [
				{
					input: "1+",
					operand: 1,
					operator: "+",
					residual: "",
				},
				{
					input: "1-",
					operand: 1,
					operator: "-",
					residual: "",
				},
				{
					input: "1*",
					operand: 1,
					operator: "*",
					residual: "",
				},
				{
					input: "1/",
					operand: 1,
					operator: "/",
					residual: "",
				},
				{
					input: "1+2",
					operand: 1,
					operator: "+",
					residual: "2",
				},
				{
					input: "-1+",
					operand: -1,
					operator: "+",
					residual: "",
				},
				{
					input: "-1-2",
					operand: -1,
					operator: "-",
					residual: "2",
				},
				{
					input: "abc-1+abc2abc",
					operand: -1,
					operator: "+",
					residual: "abc2abc",
				},
				{
					input: "1+2+3",
					operand: 1,
					operator: "+",
					residual: "2+3",
				},
			];

			scenarios.forEach(
				(scenario: {
					input: string;
					operand: number;
					operator: OgInputCalculatorOperator;
					residual: string;
				}): void => {
					it(`should push the operand ${scenario.operand} and operator '${scenario.operator}' onto the stack when the input is '${scenario.input}'`, (): void => {
						scope.inputChanged(scenario.input);
						expect(scope.push).to.have.been.calledWith(
							scenario.operand,
							scenario.operator,
						);
					});

					it(`should set the view value to '${scenario.residual}' when then input is '${scenario.input}'`, (): void => {
						scope.inputChanged(scenario.input);
						expect(ogInputCalculator["element"].val() as string).to.equal(
							scenario.residual,
						);
					});
				},
			);
		});

		describe("(value doesn't contain an operator)", (): void => {
			beforeEach((): string => scope.inputChanged("1"));

			it("should recalculate the result", (): Chai.Assertion =>
				expect(scope.calculate).to.have.been.calledWith("1"));
		});

		it("should return the current result", (): void => {
			scope.inputChanged("1+2");
			scope.result = 3;
			expect(scope.inputChanged("")).to.equal("3");
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

		it("should reset the stack", (): Chai.Assertion =>
			expect(scope.clear).to.have.been.called);

		it("should update the input value and view value", (): Chai.Assertion =>
			expect(ogInputCalculator["element"].val() as string).to.equal("1"));

		it("should close the calculator", (): Chai.Assertion =>
			expect(scope.close).to.have.been.called);
	});

	describe("cancel", (): void => {
		beforeEach((): void => {
			sinon.stub(scope, "clear");
			sinon.stub(scope, "close");
			scope.cancel();
		});

		it("should clear the calculator", (): Chai.Assertion =>
			expect(scope.clear).to.have.been.called);

		it("should close the calculator", (): Chai.Assertion =>
			expect(scope.close).to.have.been.called);
	});

	describe("clear", (): void => {
		beforeEach((): void => {
			scope.stack = [{ operand: 1 }, { operand: 2 }, { operand: 3 }];
			scope.expression = "test expression";
			scope.clear();
		});

		it("should reset the stack to an empty array", (): void => {
			expect(scope.stack).to.be.an("array");
			expect(scope.stack).to.be.empty;
		});

		it("should reset the expression", (): Chai.Assertion =>
			expect(scope.expression).to.equal(" "));
	});

	describe("close", (): void => {
		let mockAngularElement: { dispatchEvent: SinonStub }[],
			realAngularElement: JQueryStatic;

		beforeEach((): void => {
			mockAngularElement = [
				{
					dispatchEvent: sinon.stub(),
				},
			];

			realAngularElement = angular.element;
			(sinon.stub(angular, "element") as SinonStub)
				.withArgs(
					sinon.match(
						(value: JQuery<Element>): boolean =>
							value[0] === ogInputCalculator["element"][0],
					),
				)
				.returns(mockAngularElement);

			scope.close();
			$timeout.flush();
		});

		it("should hide the popover", (): Chai.Assertion =>
			expect(mockAngularElement[0].dispatchEvent).to.have.been.calledWith(
				sinon.match((event: Event): boolean => "hideCalculator" === event.type),
			));

		afterEach((): JQueryStatic => (angular.element = realAngularElement));
	});

	it("should start with a cleared calculator", (): void => {
		expect(scope.stack).to.be.an("array");
		expect(scope.stack).to.be.empty;
		expect(scope.expression).to.equal(" ");
	});

	describe("keyhandler", (): void => {
		const TEST_ACTION_KEYS: { key: string; name: string; handler: string }[] = [
			{ key: "Enter", name: "Enter", handler: "update" },
			{ key: "Escape", name: "Esc", handler: "cancel" },
			{ key: "=", name: "Equals", handler: "update" },
		];

		let event: JQueryKeyEventObjectMock,
			mockJqueryInstance: { select: SinonStub },
			realJqueryInstance: JQuery,
			actionHandler: () => void;

		beforeEach((): void => {
			event = {
				key: "-",
				preventDefault: sinon.stub(),
				stopPropagation: sinon.stub(),
			};
			(scope as DirectiveTestScope).model = 1;
			scope.$digest();
			expect(ogInputCalculator["element"].val() as string).to.equal("1");

			mockJqueryInstance = {
				select: sinon.stub(),
			};

			realJqueryInstance = $window.$ as JQuery;
			$window.$ = sinon.stub();
			$window.$.withArgs(
				sinon.match(
					(value: JQuery<Element>): boolean =>
						value[0] === ogInputCalculator["element"][0],
				),
			).returns(mockJqueryInstance);
		});

		TEST_ACTION_KEYS.forEach(
			({
				key,
				name,
				handler,
			}: {
				key: string;
				name: string;
				handler: string;
			}): void => {
				it(`should do nothing when the SHIFT+${name} keys are pressed`, (): void => {
					event.key = key;
					event.shiftKey = true;
					scope.stack = [{ operand: 1 }];
					actionHandler = sinon.stub(
						scope,
						handler as keyof OgInputCalculatorScope,
					);
					scope.keyHandler(event as JQuery.KeyDownEvent);
					$timeout.flush();
					expect(actionHandler).to.not.have.been.called;
					expect(mockJqueryInstance.select).to.not.have.been.called;
					expect(event.stopPropagation as SinonStub).to.not.have.been.called;
				});

				it(`should do nothing when the ${name} key is pressed and the stack is empty`, (): void => {
					event.key = key;
					actionHandler = sinon.stub(
						scope,
						handler as keyof OgInputCalculatorScope,
					);
					scope.keyHandler(event as JQuery.KeyDownEvent);
					$timeout.flush();
					expect(actionHandler).to.not.have.been.called;
					expect(mockJqueryInstance.select).to.not.have.been.called;
					expect(event.preventDefault as SinonStub).to.not.have.been.called;
					expect(event.stopPropagation as SinonStub).to.not.have.been.called;
				});

				it(`should invoke the ${handler} handler when the ${name} key is pressed`, (): void => {
					event.key = key;
					scope.stack = [{ operand: 1 }];
					actionHandler = sinon.stub(
						scope,
						handler as keyof OgInputCalculatorScope,
					);
					scope.keyHandler(event as JQuery.KeyDownEvent);
					$timeout.flush();
					expect(actionHandler).to.have.been.called;
					expect(mockJqueryInstance.select).to.have.been.called;
					expect(event.preventDefault as SinonStub).to.have.been.called;
					expect(event.stopPropagation as SinonStub).to.have.been.called;
				});
			},
		);

		afterEach((): JQuery => ($window.$ = realJqueryInstance));
	});

	describe("on keydown", (): void => {
		it("should invoke the keydown handler", (): void => {
			sinon.stub(scope, "keyHandler");
			ogInputCalculator["element"].triggerHandler("keydown");
			expect(scope.keyHandler).to.have.been.called;
		});
	});

	describe("on blur", (): void => {
		beforeEach((): SinonStub => sinon.stub(scope, "update"));

		it("should do nothing if the stack is empty", (): void => {
			ogInputCalculator["element"].triggerHandler("blur");
			expect(scope.update).to.not.have.been.called;
		});

		it("should invoke the blur handler", (): void => {
			scope.stack = [{ operand: 1 }];
			ogInputCalculator["element"].triggerHandler("blur");
			expect(scope.update).to.have.been.called;
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
			expect(scope.keyHandler).to.not.have.been.called;
		});

		it("should remove the blur handler from the element", (): void => {
			ogInputCalculator["element"].triggerHandler("blur");
			expect(scope.update).to.not.have.been.called;
		});
	});
});
