import {
	PromiseMockConfig,
	QMock,
	WindowMock
} from "mocks/node-modules/angular/types";
import {Mock} from "mocks/types";
import QMockProvider from "mocks/node-modules/angular/services/q";
import sinon from "sinon";

export default class WindowMockProvider implements Mock<WindowMock> {
	private readonly $window: WindowMock;

	public constructor($qMockProvider: QMockProvider) {
		const success: PromiseMockConfig<{scope: string}> = {
						args: "good-script",
						response: {scope: "test scope"}
					},
					error: PromiseMockConfig<string> = {
						args: "bad-script",
						response: "test error"
					},
					$q: QMock = $qMockProvider.$get();

		// Mock $window object
		this.$window = {
			localStorage: {
				getItem: sinon.stub(),
				removeItem: sinon.stub(),
				setItem: sinon.stub()
			},
			sessionStorage: {
				getItem: sinon.stub(),
				removeItem: sinon.stub(),
				setItem: sinon.stub()
			},
			btoa: sinon.stub().returns("base64 encoded"),
			navigator: {
				serviceWorker: {
					register: $q.promisify(success, error)
				}
			},
			console: {
				log: sinon.stub()
			}
		};

		// Configure stub responses
		this.$window.localStorage.getItem.withArgs("lootClosingBalance-1").returns(1000);
	}

	public $get(): WindowMock {
		// Return the mock $window object
		return this.$window;
	}
}

WindowMockProvider.$inject = ["$qMockProvider"];