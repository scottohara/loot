import type { Mock } from "mocks/types";
import type { SinonStub } from "sinon";
import sinon from "sinon";

export default class AnchorScrollMockProvider implements Mock<SinonStub> {
	// Mock $anchorScroll object
	public constructor(private readonly $anchorScroll: SinonStub = sinon.stub()) {}

	public $get(): SinonStub {
		return this.$anchorScroll;
	}
}

AnchorScrollMockProvider.$inject = [];