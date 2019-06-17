import { Mock } from "mocks/types";
import { OgModalConfirm } from "og-components/og-modal-confirm/types";

export default class ConfirmMockProvider implements Mock<OgModalConfirm> {
	// Mock confirm object
	public constructor(private readonly confirm: OgModalConfirm = {
		header: "Confirm?",
		message: "confirm message"
	}) {}

	public $get(): OgModalConfirm {
		// Return the mock confirm object
		return this.confirm;
	}
}

ConfirmMockProvider.$inject = [];