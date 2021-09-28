import type { Mock } from "mocks/types";
import type { UibModalInstanceMock } from "mocks/node-modules/angular/types";
import sinon from "sinon";

export default class UibModalInstanceMockProvider implements Mock<UibModalInstanceMock> {
	// Mock $uibModalInstance object
	public constructor(private readonly $uibModalInstance: UibModalInstanceMock = {
		close: sinon.stub(),
		dismiss: sinon.stub()
	}) {}

	public $get(): UibModalInstanceMock {
		return this.$uibModalInstance;
	}
}

UibModalInstanceMockProvider.$inject = [];