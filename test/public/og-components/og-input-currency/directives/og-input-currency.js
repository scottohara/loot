(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogInputCurrency", function() {
		// The object under test
		var scope,
				element,
				$compile,
				$sniffer,
				expected;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Helper function to compile the directive
		var compile = function(decimalPlaces) {
			var directive = "og-input-currency" + (decimalPlaces ? "=\"" + decimalPlaces + "\"" : "");
			return $compile("<div><input ng-model=\"model\" " + directive + "></div>")(scope).find("input");
		};

		// Inject the object under test
		beforeEach(inject(function($rootScope, _$compile_, _$sniffer_) {
			scope = $rootScope.$new();
			$compile = _$compile_;
			$sniffer = _$sniffer_;
			element = compile();
		}));

		describe("model changed", function() {
			beforeEach(function() {
				expected = "$0.00";
			});

			it("should display $0.00 if the model is undefined", function() {
				scope.model = undefined;
			});

			it("should display $0.00 if the model is null", function() {
				scope.model = null;
			});

			it("should display $ if the model is NaN", function() {
				expected = "$";
				scope.model = "abc"; // TODO - broken
			});

			it("should display the value formatted to 2 decimals if the model is a valid number", function() {
				expected = "$100,000.00";
				scope.model = 100000; // TODO - ideally this should better handle negatives (ie. -$1000.00 vs $-1000.00)
			});

			it("should display the value formatted to a specified number of decimals if the model is a valid number", function() {
				element = compile(3);
				expected = "$100,000.000";
				scope.model = 100000;
			});

			afterEach(function() {
				scope.$digest();
				element.val().should.equal(expected);
			});
		});

		describe("input changed", function() {
			beforeEach(function() {
				expected = 0;
			});

			it("should store 0 if the input is blank", function() {
				element.val("");
			});

			it("should store 0 if the input contains no numerics", function() {
				element.val("$-abcd.ef");
			});

			it("should strip any non-numerics (except periods & dashes) and store the remaining number", function() {
				expected = -1234.56;
				element.val("$-1a2b3c4d.e5f6");
			});

			afterEach(function() {
				element.triggerHandler($sniffer.hasEvent("input") ? "input" : "change");
				scope.$digest();
				scope.model.should.equal(expected);
			});
		});
	});
})();
