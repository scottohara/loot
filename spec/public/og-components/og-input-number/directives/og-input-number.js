import angular from "angular";

describe("ogInputNumber", () => {
	let ogInputNumber,
			expected;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(directiveTest => {
		ogInputNumber = directiveTest;
		ogInputNumber.configure("og-input-number", "input");
		ogInputNumber.compile();
		ogInputNumber.scope.$digest();
	}));

	describe("on model change", () => {
		beforeEach(() => (expected = "0"));

		it("should display 0 if the model is undefined", () => delete ogInputNumber.scope.model);

		it("should display 0 if the model is null", () => (ogInputNumber.scope.model = null));

		it("should display 0 if the model is NaN", () => (ogInputNumber.scope.model = "abc"));

		it("should display the value formatted as a number if the model is a valid number", () => {
			expected = "-123,456.7";
			ogInputNumber.scope.model = -123456.7;
		});

		afterEach(() => {
			ogInputNumber.scope.$digest();
			ogInputNumber.element.val().should.equal(expected);
		});
	});

	describe("on input change", () => {
		beforeEach(() => (expected = 0));

		it("should store 0 if the input is blank", () => ogInputNumber.element.val(""));

		it("should store 0 if the input contains no numerics", () => ogInputNumber.element.val("-abcd.e"));

		it("should strip any non-numerics (except periods & dashes) and store the remaining number", () => {
			expected = -1234.5;
			ogInputNumber.element.val("-1a2b3c4d.e5f");
		});

		afterEach(() => {
			ogInputNumber.element.triggerHandler("change");
			ogInputNumber.scope.$digest();
			ogInputNumber.scope.model.should.equal(expected);
		});
	});

	describe("on focus", () => {
		it("should strip any formatting", () => {
			expected = "-1,234.5";
			ogInputNumber.element.val("-1a,234.5");
			ogInputNumber.element.triggerHandler("focus");
			ogInputNumber.element.val().should.equal(expected);
		});
	});

	describe("on blur", () => {
		it("should format the value", () => {
			ogInputNumber.element.val("-1234.5");
			ogInputNumber.element.triggerHandler("blur");
			ogInputNumber.element.val().should.equal("-1,234.5");
		});
	});

	describe("on destroy", () => {
		beforeEach(() => ogInputNumber.element.triggerHandler("$destroy"));

		it("should remove the focus handler from the element", () => {
			expected = "-1a,234.5";
			ogInputNumber.element.val("-1a,234.5");
			ogInputNumber.element.triggerHandler("focus");
			ogInputNumber.element.val().should.equal(expected);
		});

		it("should remove the blur handler from the element", () => {
			ogInputNumber.element.val("-1234.5");
			ogInputNumber.element.triggerHandler("blur");
			ogInputNumber.element.val().should.equal("-1234.5");
		});
	});
});
