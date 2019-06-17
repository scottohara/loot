import DirectiveTest from "mocks/loot/directivetest";
import angular from "angular";

describe("ogLoadingSpinner", (): void => {
	let	ogLoadingSpinner: DirectiveTest;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((directiveTest: DirectiveTest): void => {
		ogLoadingSpinner = directiveTest;
		ogLoadingSpinner.configure("og-loading-spinner");
		ogLoadingSpinner.scope.model = "test message";
		ogLoadingSpinner.compile({ "og-loading-spinner": "model" });
	}));

	it("should show the specified message", (): void => {
		ogLoadingSpinner.scope.$digest();
		ogLoadingSpinner["element"].text().should.equal(" test message...\n");
	});

	it("should show the text 'Loading...' when a message was not specified", (): void => {
		ogLoadingSpinner.scope.model = null;
		ogLoadingSpinner.scope.$digest();
		ogLoadingSpinner["element"].text().should.equal(" Loading...\n");
	});
});
