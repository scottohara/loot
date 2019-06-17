import DirectiveTest from "mocks/loot/directivetest";
import angular from "angular";

describe("ogInputCurrency", (): void => {
	let	ogInputCurrency: DirectiveTest,
			expected: string | number;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((directiveTest: DirectiveTest): void => {
		ogInputCurrency = directiveTest;
		ogInputCurrency.configure("og-input-currency", "input");
		ogInputCurrency.compile();
		ogInputCurrency.scope.$digest();
	}));

	describe("on model change", (): void => {
		beforeEach((): string => (expected = "$0.00"));

		it("should display $0.00 if the model is undefined", (): boolean => delete ogInputCurrency.scope.model);

		it("should display $0.00 if the model is null", (): null => (ogInputCurrency.scope.model = null));

		it("should display $0.00 if the model is NaN", (): string => (ogInputCurrency.scope.model = "abc"));

		it("should display the value formatted to 2 decimals if the model is a valid number", (): void => {
			expected = "$100,000.00";
			ogInputCurrency.scope.model = 100000;
		});

		it("should properly position the $ symbol for negative values", (): void => {
			expected = "-$100,000.00";
			ogInputCurrency.scope.model = -100000;
		});

		it("should display the value formatted to a specified number of decimals if the model is a valid number", (): void => {
			ogInputCurrency.compile({ "og-input-currency": "3" });
			expected = "$100,000.000";
			ogInputCurrency.scope.model = 100000;
		});

		afterEach((): void => {
			ogInputCurrency.scope.$digest();
			(ogInputCurrency["element"].val() as string).should.equal(expected);
		});
	});

	describe("on input change", (): void => {
		beforeEach((): number => (expected = 0));

		it("should store 0 if the input is blank", (): JQuery<Element> => ogInputCurrency["element"].val(""));

		it("should store 0 if the input contains no numerics", (): JQuery<Element> => ogInputCurrency["element"].val("$-abcd.ef"));

		it("should strip any non-numerics (except periods & dashes) and store the remaining number", (): void => {
			expected = -1234.56;
			ogInputCurrency["element"].val("$-1a2b3c4d.e5f6");
		});

		afterEach((): void => {
			ogInputCurrency["element"].triggerHandler("change");
			ogInputCurrency.scope.$digest();
			(ogInputCurrency.scope.model as number).should.equal(expected);
		});
	});

	describe("on focus", (): void => {
		it("should strip any formatting", (): void => {
			expected = "-1,234.56";
			ogInputCurrency.scope.model = -1234.56;
			ogInputCurrency.scope.$digest();
			(ogInputCurrency["element"].val() as string).should.equal("-$1,234.56");
			ogInputCurrency["element"].triggerHandler("focus");
			(ogInputCurrency["element"].val() as string).should.equal(expected);
		});
	});

	describe("on blur", (): void => {
		it("should format the value", (): void => {
			ogInputCurrency["element"].val("-1234.56");
			ogInputCurrency["element"].triggerHandler("blur");
			(ogInputCurrency["element"].val() as string).should.equal("-$1,234.56");
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => ogInputCurrency["element"].triggerHandler("$destroy"));

		it("should remove the focus handler from the element", (): void => {
			expected = "-$1,234.56";
			ogInputCurrency.scope.model = "-1234.56";
			ogInputCurrency.scope.$digest();
			(ogInputCurrency["element"].val() as string).should.equal("-$1,234.56");
			ogInputCurrency["element"].triggerHandler("focus");
			(ogInputCurrency["element"].val() as string).should.equal(expected);
		});

		it("should remove the blur handler from the element", (): void => {
			ogInputCurrency["element"].val("-1234.56");
			ogInputCurrency["element"].triggerHandler("blur");
			(ogInputCurrency["element"].val() as string).should.equal("-1234.56");
		});
	});
});
