import type { AuthenticationModelMock } from "mocks/authentication/types";
import type { Mock } from "mocks/types";
import type { QMock } from "mocks/node-modules/angular/types";
import type QMockProvider from "mocks/node-modules/angular/services/q";
import sinon from "sinon";

export default class AuthenticationModelMockProvider implements Mock<AuthenticationModelMock> {
	private readonly authenticationModel: AuthenticationModelMock;

	public constructor($qMockProvider: QMockProvider) {
		const $q: QMock = $qMockProvider.$get();

		// Mock authenticationModel object
		this.authenticationModel = {
			login: $q.promisify("gooduser", "baduser"),
			logout: sinon.stub(),
			isAuthenticated: true
		};
	}

	public $get(): AuthenticationModelMock {
		// Return the mock authenticationModel object
		return this.authenticationModel;
	}
}

AuthenticationModelMockProvider.$inject = ["$qMockProvider"];