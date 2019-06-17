import sinon, { SinonStub } from "sinon";
import { Mock } from "mocks/types";

export default class AnchorScrollMockProvider implements Mock<SinonStub> {
	// Mock $anchorScroll object
	public constructor(private readonly $anchorScroll: SinonStub = sinon.stub()) {}

	public $get(): SinonStub {
		return this.$anchorScroll;
	}
}

AnchorScrollMockProvider.$inject = [];