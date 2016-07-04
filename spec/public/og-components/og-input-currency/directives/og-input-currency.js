describe("ogInputCurrency", () => {
	let	ogInputCurrency,
			expected;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(directiveTest => {
		ogInputCurrency = directiveTest;
		ogInputCurrency.configure("og-input-currency", "input");
		ogInputCurrency.compile();
		ogInputCurrency.scope.$digest();
	}));

	describe("on model change", () => {
		beforeEach(() => (expected = "$0.00"));

		it("should display $0.00 if the model is undefined", () => Reflect.deleteProperty(ogInputCurrency.scope, "model"));

		it("should display $0.00 if the model is null", () => (ogInputCurrency.scope.model = null));

		it("should display $0.00 if the model is NaN", () => (ogInputCurrency.scope.model = "abc"));

		it("should display the value formatted to 2 decimals if the model is a valid number", () => {
			expected = "$100,000.00";
			ogInputCurrency.scope.model = 100000;
		});

		it("should properly position the $ symbol for negative values", () => {
			expected = "-$100,000.00";
			ogInputCurrency.scope.model = -100000;
		});

		it("should display the value formatted to a specified number of decimals if the model is a valid number", () => {
			ogInputCurrency.compile({"og-input-currency": 3});
			expected = "$100,000.000";
			ogInputCurrency.scope.model = 100000;
		});

		afterEach(() => {
			ogInputCurrency.scope.$digest();
			ogInputCurrency.element.val().should.equal(expected);
		});
	});

	describe("on input change", () => {
		beforeEach(() => (expected = 0));

		it("should store 0 if the input is blank", () => ogInputCurrency.element.val(""));

		it("should store 0 if the input contains no numerics", () => ogInputCurrency.element.val("$-abcd.ef"));

		it("should strip any non-numerics (except periods & dashes) and store the remaining number", () => {
			expected = -1234.56;
			ogInputCurrency.element.val("$-1a2b3c4d.e5f6");
		});

		afterEach(() => {
			ogInputCurrency.element.triggerHandler("change");
			ogInputCurrency.scope.$digest();
			ogInputCurrency.scope.model.should.equal(expected);
		});
	});

	describe("on focus", () => {
		it("should strip any formatting", () => {
			expected = "-1,234.56";
			ogInputCurrency.scope.model = -1234.56;
			ogInputCurrency.scope.$digest();
			ogInputCurrency.element.val().should.equal("-$1,234.56");
			ogInputCurrency.element.triggerHandler("focus");
			ogInputCurrency.element.val().should.equal(expected);
		});
	});

	describe("on blur", () => {
		it("should format the value", () => {
			ogInputCurrency.element.val("-1234.56");
			ogInputCurrency.element.triggerHandler("blur");
			ogInputCurrency.element.val().should.equal("-$1,234.56");
		});
	});

	describe("on destroy", () => {
		beforeEach(() => ogInputCurrency.element.triggerHandler("$destroy"));

		it("should remove the focus handler from the element", () => {
			expected = "-$1,234.56";
			ogInputCurrency.scope.model = "-1234.56";
			ogInputCurrency.scope.$digest();
			ogInputCurrency.element.val().should.equal("-$1,234.56");
			ogInputCurrency.element.triggerHandler("focus");
			ogInputCurrency.element.val().should.equal(expected);
		});

		it("should remove the blur handler from the element", () => {
			ogInputCurrency.element.val("-1234.56");
			ogInputCurrency.element.triggerHandler("blur");
			ogInputCurrency.element.val().should.equal("-1234.56");
		});
	});
});
