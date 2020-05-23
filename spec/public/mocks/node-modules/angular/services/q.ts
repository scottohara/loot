import {
	DeferredMock,
	PromiseMock,
	PromiseMockCallback,
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import sinon, { SinonStub } from "sinon";
import { Mock } from "mocks/types";
import angular from "angular";

export default class QMockProvider implements Mock<QMock> {
	// Mock $q object
	public constructor(private readonly $q: QMock = {
		defer<T>(): DeferredMock<T> {
			let	isResolved = false,
					promiseValue: T | PromiseMock<T> | undefined,
					callbackResult: T | PromiseMock<T>;

			function updateValueAndReturn(result: PromiseMock<T> | T, promise: PromiseMock<T>): PromiseMock<T> | T {
				// If the callback yielded a promise, we'll simply return that
				if (undefined !== result && undefined !== (result as PromiseMock<T>).then && angular.isFunction((result as PromiseMock<T>).then.bind(result))) {
					return result;
				}

				// Otherwise, update the promise value to the callback result; and return the existing promise
				promiseValue = undefined === result ? promiseValue : result;

				return promise;
			}

			return {
				resolve(value?: T): void {
					promiseValue = value;
					isResolved = true;
				},
				reject(value: T): void {
					promiseValue = value;
				},
				promise: {
					then(successCallback: PromiseMockCallback<T>, errorCallback: PromiseMockCallback<T>): PromiseMock<T> | T {
						if (isResolved) {
							callbackResult = successCallback(promiseValue);
						} else if (undefined !== errorCallback) {
							callbackResult = errorCallback(promiseValue);
						}

						return updateValueAndReturn(callbackResult, this);
					},
					catch(errorCallback: PromiseMockCallback<T>): PromiseMock<T> | T {
						if (!isResolved) {
							callbackResult = errorCallback(promiseValue);
						}

						return updateValueAndReturn(callbackResult, this);
					}
				}
			};
		},
		promisify<T, U>(success?: PromiseMockConfig<T> | string | number, error?: PromiseMockConfig<U> | string | number): SinonStub {
			// Helper function to promise-ify a stub with success and error responses

			// Create two new promises, one for a success and one for an error
			const qSuccess: DeferredMock<T> = this.defer(),
						qError: DeferredMock<T> = this.defer(),
						stub: SinonStub = sinon.stub();

			// Auto-resolve the success promise with the specified success response
			qSuccess.resolve(undefined === success ? null : (success as PromiseMockConfig<T>).response);

			// Auto-reject the error promise with the specified error response
			qError.reject(undefined !== error && undefined !== (error as PromiseMockConfig<T>).response ? (error as PromiseMockConfig<T>).response : { data: "unsuccessful" });

			// Configure the stub to return the appropriate promise based on the call arguments
			if (undefined === success || (angular.isObject(success) && undefined === (success as PromiseMockConfig<T>).args)) {
				// No success args specified, so default response is a success
				stub.returns(qSuccess.promise);
			} else {
				stub.withArgs(sinon.match((undefined === (success as PromiseMockConfig<T>).args ? success : (success as PromiseMockConfig<T>).args) as object)).returns(qSuccess.promise);
			}

			if (undefined !== error) {
				stub.withArgs(sinon.match((undefined === (error as PromiseMockConfig<T>).args ? error : (error as PromiseMockConfig<T>).args) as object)).returns(qError.promise);
			}

			return stub;
		}
	}) {}

	public $get(): QMock {
		// Return the mock $q object
		return this.$q;
	}
}

QMockProvider.$inject = [];