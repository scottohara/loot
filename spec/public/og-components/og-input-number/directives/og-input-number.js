(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputNumber", function() {
		// The object under test
		var ogInputNumber,
				expected;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest) {
			ogInputNumber = directiveTest;
			ogInputNumber.configure("og-input-number", "input");
			ogInputNumber.compile();
			ogInputNumber.scope.$digest();
		}));

		describe("on model change", function() {
			beforeEach(function() {
				expected = "0";
			});

			it("should display 0 if the model is undefined", function() {
				ogInputNumber.scope.model = undefined;
			});

			it("should display 0 if the model is null", function() {
				ogInputNumber.scope.model = null;
			});

			it("should display 0 if the model is NaN", function() {
				ogInputNumber.scope.model = "abc";
			});

			it("should display the value formatted as a number if the model is a valid number", function() {
				expected = "-123,456.7";
				ogInputNumber.scope.model = -123456.7;
			});

			afterEach(function() {
				ogInputNumber.scope.$digest();
				ogInputNumber.element.val().should.equal(expected);
			});
		});

		describe("on input change", function() {
			beforeEach(function() {
				expected = 0;
			});

			it("should store 0 if the input is blank", function() {
				ogInputNumber.element.val("");
			});

			it("should store 0 if the input contains no numerics", function() {
				ogInputNumber.element.val("-abcd.e");
			});

			it("should strip any non-numerics (except periods & dashes) and store the remaining number", function() {
				expected = -1234.5;
				ogInputNumber.element.val("-1a2b3c4d.e5f");
			});

			afterEach(function() {
				ogInputNumber.element.triggerHandler("change");
				ogInputNumber.scope.$digest();
				ogInputNumber.scope.model.should.equal(expected);
			});
		});

		describe("on focus", function() {
			it("should strip any formatting", function() {
				expected = "-1,234.5";
				ogInputNumber.element.val("-1a,234.5");
				ogInputNumber.element.triggerHandler("focus");
				ogInputNumber.element.val().should.equal(expected);
			});
		});

		describe("on blur", function() {
			it("should format the value", function() {
				ogInputNumber.element.val("-1234.5");
				ogInputNumber.element.triggerHandler("blur");
				ogInputNumber.element.val().should.equal("-1,234.5");
			});
		});

		describe("on destroy", function() {
			beforeEach(function() {
				ogInputNumber.element.triggerHandler("$destroy");
			});

			it("should remove the focus handler from the element", function() {
				expected = "-1a,234.5";
				ogInputNumber.element.val("-1a,234.5");
				ogInputNumber.element.triggerHandler("focus");
				ogInputNumber.element.val().should.equal(expected);
			});

			it("should remove the blur handler from the element", function() {
				ogInputNumber.element.val("-1234.5");
				ogInputNumber.element.triggerHandler("blur");
				ogInputNumber.element.val().should.equal("-1234.5");
			});
		});
	});
})();
