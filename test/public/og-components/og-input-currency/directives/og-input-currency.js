(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputCurrency", function() {
		// The object under test
		var ogInputCurrency,
				expected;

		// Dependencies
		var $timeout;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(_$timeout_, directiveTest) {
			$timeout = _$timeout_;
			ogInputCurrency = directiveTest;
			ogInputCurrency.configure("og-input-currency", "input");
			ogInputCurrency.compile();
		}));

		describe("on model change", function() {
			beforeEach(function() {
				expected = "$0.00";
			});

			it("should display $0.00 if the model is undefined", function() {
				ogInputCurrency.scope.model = undefined;
			});

			it("should display $0.00 if the model is null", function() {
				ogInputCurrency.scope.model = null;
			});

			it("should display $0.00 if the model is NaN", function() {
				ogInputCurrency.scope.model = "abc";
			});

			it("should display the value formatted to 2 decimals if the model is a valid number", function() {
				expected = "$100,000.00";
				ogInputCurrency.scope.model = 100000;
			});

			it("should properly position the $ symbol for negative values", function() {
				expected = "-$100,000.00";
				ogInputCurrency.scope.model = -100000;
			});

			it("should display the value formatted to a specified number of decimals if the model is a valid number", function() {
				ogInputCurrency.compile({"og-input-currency": 3});
				expected = "$100,000.000";
				ogInputCurrency.scope.model = 100000;
			});

			afterEach(function() {
				ogInputCurrency.scope.$digest();
				ogInputCurrency.element.val().should.equal(expected);
			});
		});

		describe("on input change", function() {
			beforeEach(function() {
				expected = 0;
			});

			it("should store 0 if the input is blank", function() {
				ogInputCurrency.element.val("");
			});

			it("should store 0 if the input contains no numerics", function() {
				ogInputCurrency.element.val("$-abcd.ef");
			});

			it("should strip any non-numerics (except periods & dashes) and store the remaining number", function() {
				expected = -1234.56;
				ogInputCurrency.element.val("$-1a2b3c4d.e5f6");
			});

			afterEach(function() {
				ogInputCurrency.element.triggerHandler("change");
				ogInputCurrency.scope.$digest();
				ogInputCurrency.scope.model.should.equal(expected);
			});
		});

		describe("on focus", function() {
			var mockJQueryInstance,
					realJQueryInstance;

			beforeEach(function() {
				mockJQueryInstance = {
					select: sinon.stub()
				};

				realJQueryInstance = window.$;
				window.$ = sinon.stub();
				window.$.withArgs(ogInputCurrency.element).returns(mockJQueryInstance);

				expected = "-1,234.56";
				ogInputCurrency.scope.model = -1234.56;
				ogInputCurrency.scope.$digest();
				ogInputCurrency.element.val().should.equal("-$1,234.56");
				ogInputCurrency.element.triggerHandler("focus");
				$timeout.flush();
			});

			it("should strip any formatting", function() {
				ogInputCurrency.element.val().should.equal(expected);
			});

			it("should select the input value", function() {
				mockJQueryInstance.select.should.have.been.called;
			});

			afterEach(function() {
				$timeout.verifyNoPendingTasks();
				window.$ = realJQueryInstance;
			});
		});

		describe("on blur", function() {
			it("should format the value", function() {
				ogInputCurrency.element.val("-1234.56");
				ogInputCurrency.element.triggerHandler("blur");
				ogInputCurrency.element.val().should.equal("-$1,234.56");
			});
		});
	});
})();
