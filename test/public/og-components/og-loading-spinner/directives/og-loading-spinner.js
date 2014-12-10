(function() {
	"use strict";

	/*jshint expr: true */

	describe("ogLoadingSpinner", function() {
		// The object under test
		var ogLoadingSpinner;

		// Load the modules
		beforeEach(module("lootMocks", "ogComponents"));

		// Load the template
		beforeEach(module("og-components/og-loading-spinner/views/loading.html"));

		// Configure & compile the object under test
		beforeEach(inject(function(directiveTest) {
			ogLoadingSpinner = directiveTest;
			ogLoadingSpinner.configure("og-loading-spinner");
			ogLoadingSpinner.scope.model = "test message";
			ogLoadingSpinner.compile({"og-loading-spinner": "model"}, true);
		}));

		it("should show the specified message", function() {
			ogLoadingSpinner.scope.$digest();
			ogLoadingSpinner.element.text().should.equal(" test message...\n");
		});

		it("should show the text 'Loading...' when a message was not specified", function() {
			ogLoadingSpinner.scope.model = undefined;
			ogLoadingSpinner.scope.$digest();
			ogLoadingSpinner.element.text().should.equal(" Loading...\n");
		});
	});
})();
