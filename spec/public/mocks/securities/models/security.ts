import {
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import sinon, {SinonStub} from "sinon";
import {Mock} from "mocks/types";
import QMockProvider from "mocks/node-modules/angular/services/q";
import SecuritiesMockProvider from "mocks/securities/providers/securities";
import {Security} from "securities/types";
import SecurityMockProvider from "mocks/securities/providers/security";
import {SecurityModelMock} from "mocks/securities/types";

export default class SecurityModelMockProvider implements Mock<SecurityModelMock> {
	private readonly securityModel: SecurityModelMock;

	public constructor(securityMockProvider: SecurityMockProvider, securitiesMockProvider: SecuritiesMockProvider, $qMockProvider: QMockProvider) {
		// Success/error = options for the stub promises
		const	success: PromiseMockConfig<{data: Security}> = {
						args: {id: 1},
						response: {data: securityMockProvider.$get()}
					},
					error: PromiseMockConfig<void> = {
						args: {id: -1}
					},
					$q: QMock = $qMockProvider.$get();

		// Mock securityModel object
		this.securityModel = {
			path(id: number): string {
				return `/securities/${id}`;
			},
			recent: "recent securities list",
			type: "security",
			all: $q.promisify({
				response: securitiesMockProvider.$get()
			}),
			allWithBalances: sinon.stub().returns(securitiesMockProvider.$get()),
			find(id: number): SinonStub {
				// Get the matching security
				const security: Security = securitiesMockProvider.$get()[id - 1];

				// Return a promise-like object that resolves with the security
				return $q.promisify({response: security})();
			},
			findLastTransaction: $q.promisify({response: {}}, {args: -1}),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error),
			toggleFavourite(security: Security): SinonStub {
				return $q.promisify({response: !security.favourite})();
			},
			flush: sinon.stub(),
			addRecent: sinon.stub()
		};

		// Spy on find() and toggleFavourite()
		sinon.spy(this.securityModel, "find");
		sinon.spy(this.securityModel, "toggleFavourite");
	}

	public $get(): SecurityModelMock {
		// Return the mock securityModel object
		return this.securityModel;
	}
}

SecurityModelMockProvider.$inject = ["securityMockProvider", "securitiesMockProvider", "$qMockProvider"];