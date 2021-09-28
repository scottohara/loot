import type DirectiveTest from "mocks/loot/directivetest";
import angular from "angular";

describe("ogInputNumber", (): void => {
	let ogInputNumber: DirectiveTest,
			expected: number | string;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((directiveTest: DirectiveTest): void => {
		ogInputNumber = directiveTest;
		ogInputNumber.configure("og-input-number", "input");
		ogInputNumber.compile();
		ogInputNumber.scope.$digest();
	}) as Mocha.HookFunction);

	describe("on model change", (): void => {
		beforeEach((): string => (expected = "0"));

		it("should display 0 if the model is undefined", (): boolean => delete ogInputNumber.scope.model);

		it("should display 0 if the model is null", (): null => (ogInputNumber.scope.model = null));

		it("should display 0 if the model is NaN", (): string => (ogInputNumber.scope.model = "abc"));

		it("should display the value formatted as a number if the model is a valid number", (): void => {
			expected = "-123,456.7";
			ogInputNumber.scope.model = -123456.7;
		});

		afterEach((): void => {
			ogInputNumber.scope.$digest();
			(ogInputNumber["element"].val() as string).should.equal(expected);
		});
	});

	describe("on input change", (): void => {
		beforeEach((): number => (expected = 0));

		it("should store 0 if the input is blank", (): JQuery<Element> => ogInputNumber["element"].val(""));

		it("should store 0 if the input contains no numerics", (): JQuery<Element> => ogInputNumber["element"].val("-abcd.e"));

		it("should strip any non-numerics (except periods & dashes) and store the remaining number", (): void => {
			expected = -1234.5;
			ogInputNumber["element"].val("-1a2b3c4d.e5f");
		});

		afterEach((): void => {
			ogInputNumber["element"].triggerHandler("change");
			ogInputNumber.scope.$digest();
			(ogInputNumber.scope.model as number).should.equal(expected);
		});
	});

	describe("on focus", (): void => {
		it("should strip any formatting", (): void => {
			expected = "-1,234.5";
			ogInputNumber["element"].val("-1a,234.5");
			ogInputNumber["element"].triggerHandler("focus");
			(ogInputNumber["element"].val() as string).should.equal(expected);
		});
	});

	describe("on blur", (): void => {
		it("should format the value", (): void => {
			ogInputNumber["element"].val("-1234.5");
			ogInputNumber["element"].triggerHandler("blur");
			(ogInputNumber["element"].val() as string).should.equal("-1,234.5");
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => ogInputNumber["element"].triggerHandler("$destroy"));

		it("should remove the focus handler from the element", (): void => {
			expected = "-1a,234.5";
			ogInputNumber["element"].val("-1a,234.5");
			ogInputNumber["element"].triggerHandler("focus");
			(ogInputNumber["element"].val() as string).should.equal(expected);
		});

		it("should remove the blur handler from the element", (): void => {
			ogInputNumber["element"].val("-1234.5");
			ogInputNumber["element"].triggerHandler("blur");
			(ogInputNumber["element"].val() as string).should.equal("-1234.5");
		});
	});
});
