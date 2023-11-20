import type { SinonStub } from "sinon";

export interface AuthenticationModelMock {
	login: SinonStub;
	logout: SinonStub;
	isAuthenticated: boolean;
}
