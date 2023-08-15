import type { Mock } from "~/mocks/types";
import type { OgModalErrorServiceMock } from "~/mocks/og-components/og-modal-error/types";
import sinon from "sinon";

export default class OgModalErrorServiceMockProvider implements Mock<OgModalErrorServiceMock> {
	public constructor(private readonly ogModalErrorService: OgModalErrorServiceMock = {
		showError: sinon.stub()
	}) {}

	public $get(): OgModalErrorServiceMock {
		return this.ogModalErrorService;
	}
}

OgModalErrorServiceMockProvider.$inject = [];