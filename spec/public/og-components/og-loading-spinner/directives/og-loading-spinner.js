import angular from "angular";

describe("ogLoadingSpinner", () => {
	let	ogLoadingSpinner;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject(directiveTest => {
		ogLoadingSpinner = directiveTest;
		ogLoadingSpinner.configure("og-loading-spinner");
		ogLoadingSpinner.scope.model = "test message";
		ogLoadingSpinner.compile({"og-loading-spinner": "model"});
	}));

	it("should show the specified message", () => {
		ogLoadingSpinner.scope.$digest();
		ogLoadingSpinner.element.text().should.equal(" test message...\n");
	});

	it("should show the text 'Loading...' when a message was not specified", () => {
		ogLoadingSpinner.scope.model = null;
		ogLoadingSpinner.scope.$digest();
		ogLoadingSpinner.element.text().should.equal(" Loading...\n");
	});
});
