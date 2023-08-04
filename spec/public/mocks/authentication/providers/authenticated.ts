import type { Mock } from "mocks/types";

export default class AuthenticatedMockProvider implements Mock<boolean> {
	public constructor(private readonly authenticated = true) {}

	public $get(): boolean {
		// Return the mock authenticated status object
		return this.authenticated;
	}
}

AuthenticatedMockProvider.$inject = [];