export default class OgInputNumberControllerMockProvider {
	// Mock input number controller object
	ogInputNumberController() {
		this.type = "ogInputNumberController";
		this.formattedToRaw = sinon.stub().returnsArg(0);
		this.rawToFormatted = sinon.stub().returnsArg(0);
	}

	$get() {
		// Return the mock input number controller object
		return this.ogInputNumberController;
	}
}

OgInputNumberControllerMockProvider.$inject = [];