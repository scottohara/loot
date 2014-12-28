(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputCurrencyController", function() {
		// The object under test
		var ogInputCurrencyController;

		// Dependencies
		var controllerTest;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Configure & compile the object under test
		beforeEach(inject(function(_controllerTest_) {
			controllerTest = _controllerTest_;
			ogInputCurrencyController = controllerTest("ogInputCurrencyController");
		}));

		it("should default to 2 decimal places", function() {
			ogInputCurrencyController.decimalPlaces.should.equal(2);
		});

		describe("setDecimalPlaces", function() {
			it("should default to 2 decimals if the value is undefined", function() {
				ogInputCurrencyController.setDecimalPlaces(undefined);
				ogInputCurrencyController.decimalPlaces.should.equal(2);
			});

			it("should default to 2 decimals if the value is null", function() {
				ogInputCurrencyController.setDecimalPlaces(null);
				ogInputCurrencyController.decimalPlaces.should.equal(2);
			});

			it("should default to 2 decimals if the value is NaN", function() {
				ogInputCurrencyController.setDecimalPlaces("abc");
				ogInputCurrencyController.decimalPlaces.should.equal(2);
			});

			it("should set the specified number of decimals if valid", function() {
				ogInputCurrencyController.setDecimalPlaces(3);
				ogInputCurrencyController.decimalPlaces.should.equal(3);
			});
		});

		describe("formattedToRaw", function() {
			it("should return 0 if the value is blank", function() {
				ogInputCurrencyController.formattedToRaw("").should.equal(0);
			});

			it("should return 0 if the value contains no numerics", function() {
				ogInputCurrencyController.formattedToRaw("-abcd.e").should.equal(0);
			});

			it("should strip any non-numerics (except periods & dashes) and return the remaining number", function() {
				ogInputCurrencyController.formattedToRaw("$-1a2b3c4d.e5f6").should.equal(-1234.56);
			});
		});

		describe("rawToFormatted", function() {
			it("should return $0.00 if the value is undefined", function() {
				ogInputCurrencyController.rawToFormatted(undefined).should.equal("$0.00");
			});

			it("should return $0.00 if the value is null", function() {
				ogInputCurrencyController.rawToFormatted(null).should.equal("$0.00");
			});

			it("should return $0.00 if the value is NaN", function() {
				ogInputCurrencyController.rawToFormatted("abc").should.equal("$0.00");
			});

			it("should display the value formatted to 2 decimals if the model is a valid number", function() {
				ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.00");
			});

			it("should properly position the $ symbol for negative values", function() {
				ogInputCurrencyController.rawToFormatted(-100000).should.equal("-$100,000.00");
			});

			it("should display the value formatted to a specified number of decimals if the model is a valid number", function() {
				ogInputCurrencyController.decimalPlaces = 3;
				ogInputCurrencyController.rawToFormatted(100000).should.equal("$100,000.000");
			});
		});

		it("should expose the formattedToRaw function on the controller instance", function() {
			ogInputCurrencyController.formattedToRaw.should.deep.equal(ogInputCurrencyController.ogInputCurrencyController.formattedToRaw);
		});

		it("should expose the rawToFormatted function on the controller instance", function() {
			ogInputCurrencyController.rawToFormatted.should.deep.equal(ogInputCurrencyController.ogInputCurrencyController.rawToFormatted);
		});
	});
})();
