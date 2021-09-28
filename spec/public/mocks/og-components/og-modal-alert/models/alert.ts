import type { Mock } from "mocks/types";
import type { OgModalAlert } from "og-components/og-modal-alert/types";

export default class AlertMockProvider implements Mock<OgModalAlert> {
	// Mock alert object
	public constructor(private readonly alert: OgModalAlert = {
		header: "Alert!",
		message: "alert message"
	}) {}

	public $get(): OgModalAlert {
		// Return the mock alert object
		return this.alert;
	}
}

AlertMockProvider.$inject = [];