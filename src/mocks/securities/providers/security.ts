import type { Mock } from "~/mocks/types";
import type { Security } from "~/securities/types";
import createSecurity from "~/mocks/securities/factories";

export default class SecurityMockProvider implements Mock<Security> {
	// Mock security object
	public constructor(
		private readonly security: Security = createSecurity({
			id: 1,
			name: "aa",
			closing_balance: 1.006,
			code: "A",
			current_holding: 1,
		}),
	) {}

	public $get(): Security {
		// Return the mock security object
		return this.security;
	}
}

SecurityMockProvider.$inject = [];
