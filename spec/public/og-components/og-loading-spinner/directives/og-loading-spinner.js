describe("ogLoadingSpinner", () => {
	let	ogLoadingSpinner;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Load the template
	beforeEach(module("og-components/og-loading-spinner/views/loading.html"));

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
