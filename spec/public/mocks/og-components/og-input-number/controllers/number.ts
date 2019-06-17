import {
	OgInputNumberControllerMock,
	OgInputNumberControllerType
} from "mocks/og-components/og-input-number/types";
import { Mock } from "mocks/types";
import sinon from "sinon";

export default class OgInputNumberControllerMockProvider implements Mock<OgInputNumberControllerMock> {
	private readonly ogInputNumberController: OgInputNumberControllerMock;

	// Mock input number controller object
	public constructor() {
		this.ogInputNumberController = (): OgInputNumberControllerType => ({
			type: "ogInputNumberController",
			formattedToRaw: sinon.stub(),
			rawToFormatted: sinon.stub()
		});
	}

	public $get(): OgInputNumberControllerMock {
		// Return the mock input number controller object
		return this.ogInputNumberController;
	}
}

OgInputNumberControllerMockProvider.$inject = [];