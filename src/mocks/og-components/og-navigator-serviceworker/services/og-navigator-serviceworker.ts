import type { Mock } from "~/mocks/types";
import type { OgNavigatorServiceWorkerServiceMock } from "~/mocks/og-components/og-navigator-serviceworker/types";
import sinon from "sinon";

export default class OgNavigatorServiceWorkerServiceMockProvider implements Mock<OgNavigatorServiceWorkerServiceMock> {
	public constructor(private readonly ogNavigatorServiceWorkerService: OgNavigatorServiceWorkerServiceMock = {
		register: sinon.stub()
	}) {}

	public $get(): OgNavigatorServiceWorkerServiceMock {
		// Return the mock confirm object
		return this.ogNavigatorServiceWorkerService;
	}
}

OgNavigatorServiceWorkerServiceMockProvider.$inject = [];