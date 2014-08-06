(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputNumber", function() {
		// The object under test
		var ogInputNumber,
				expected;

		// Dependencies
		var $timeout;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(_$timeout_, directiveTest) {
			$timeout = _$timeout_;
			ogInputNumber = directiveTest;
			ogInputNumber.configure("og-input-number", "input");
			ogInputNumber.compile();
		}));

		describe("model changed", function() {
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

		describe("input changed", function() {
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

		describe("input focussed", function() {
			var mockJQueryInstance;

			beforeEach(function() {
				mockJQueryInstance = {
					select: sinon.stub()
				};

				window.$ = sinon.stub();
				window.$.withArgs(ogInputNumber.element).returns(mockJQueryInstance);

				expected = "-1,234.5";
				ogInputNumber.element.val("-1,234.5");
				ogInputNumber.element.triggerHandler("focus");
			});

			it("should strip any formatting", function() {
				ogInputNumber.element.val().should.equal(expected);
			});

			it("should select the input value", function() {
				$timeout.flush();
				mockJQueryInstance.select.should.have.been.called;
				$timeout.verifyNoPendingTasks();
			});
		});

		describe("input blurred", function() {
			it("should format the value", function() {
				ogInputNumber.element.val("-1234.5");
				ogInputNumber.element.triggerHandler("blur");
				ogInputNumber.element.val().should.equal("-1,234.5");
			});
		});
	});
})();
