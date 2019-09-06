import {
	UibModalMock,
	UibModalMockCloseResult,
	UibModalMockResolve,
	UibModalMockResolves,
	UibModalMockResult,
	UibModalMockResultCallback
} from "mocks/node-modules/angular/types";
import { IModalSettings } from "angular-ui-bootstrap";
import { Mock } from "mocks/types";
import sinon from "sinon";

export default class UibModalMockProvider implements Mock<UibModalMock> {
	// Mock $uibModal object
	public constructor(private readonly $uibModal: UibModalMock = {
		open(options: IModalSettings): {result: UibModalMockResult;} {
			const self: UibModalMock = this;

			// If there are any resolves, resolve them
			if (options.resolve) {
				this.resolves = Object.keys(options.resolve).reduce((resolves: UibModalMockResolves, resolve: string): UibModalMockResolves => {
					resolves[resolve] = options.resolve && (options.resolve[resolve] as () => UibModalMockResolve)();

					return resolves;
				}, {});
			}

			/*
			 * Return a result object that is promise-like, but instead of invoking the callbacks it just stores them
			 * for later use by close() and dismiss()
			 */
			return {
				result: {
					then(callback: UibModalMockResultCallback): UibModalMockResult {
						// Store the callback
						self.closeCallback = callback;

						return this;
					},
					catch(callback: UibModalMockResultCallback): UibModalMockResult {
						self.catchCallback = callback;

						return this;
					},
					finally(callback: UibModalMockResultCallback): UibModalMockResult {
						self.finallyCallback = callback;

						return this;
					}
				}
			};
		},
		close(value?: UibModalMockCloseResult): void {
			this.callbackResult = this.closeCallback && this.closeCallback(value);
			if (this.finallyCallback) {
				this.callbackResult = this.finallyCallback(this.callbackResult);
			}
		},
		dismiss(): void {
			this.callbackResult = (this.catchCallback as UibModalMockResultCallback)();

			if (this.finallyCallback) {
				this.callbackResult = this.finallyCallback(this.callbackResult);
			}
		}
	}) {
		// Spy on open()
		sinon.spy(this.$uibModal, "open");
	}

	public $get(): UibModalMock {
		return this.$uibModal;
	}
}

UibModalMockProvider.$inject = [];