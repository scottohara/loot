import type {
	DeferredMock,
	PromiseMock,
	PromiseMockCallback,
	PromiseMockConfig,
	PromiseMockThen,
	QMock,
} from "~/mocks/node-modules/angular/types";
import sinon, { type SinonStub } from "sinon";
import type { Mock } from "~/mocks/types";
import angular from "angular";

export default class QMockProvider implements Mock<QMock> {
	// Mock $q object
	public constructor(
		private readonly $q: QMock = {
			defer<T>(): DeferredMock<T> {
				let isResolved = false,
					promiseValue: PromiseMock<T> | T | undefined,
					callbackResult: PromiseMock<T> | T;

				function updateValueAndReturn(
					result: PromiseMock<T> | T | undefined,
					promise: PromiseMock<T>,
				): PromiseMock<T> | T {
					// If the callback yielded a promise, we'll simply return that
					if (
						undefined !== result &&
						undefined !== (result as PromiseMock<T>).then &&
						angular.isFunction(
							((result as PromiseMock<T>).then as PromiseMockThen<T>).bind(
								result,
							),
						)
					) {
						return result as PromiseMock<T>;
					}

					// Otherwise, update the promise value to the callback result; and return the existing promise
					promiseValue = result ?? promiseValue;

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
						then(
							successCallback: PromiseMockCallback<T>,
							errorCallback?: PromiseMockCallback<T>,
						): PromiseMock<T> | T {
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
						},
					},
				};
			},
			promisify<T, U>(
				success?: PromiseMockConfig<T> | number | string,
				error?: PromiseMockConfig<U> | number | string,
			): SinonStub {
				// Helper function to promise-ify a stub with success and error responses

				// Create two new promises, one for a success and one for an error
				const qSuccess: DeferredMock<T> = this.defer(),
					qError: DeferredMock<T> = this.defer(),
					stub: SinonStub = sinon.stub();

				// Auto-resolve the success promise with the specified success response
				qSuccess.resolve(
					(success as PromiseMockConfig<T> | undefined)?.response ?? null,
				);

				// Auto-reject the error promise with the specified error response
				qError.reject(
					(error as PromiseMockConfig<T> | undefined)?.response ?? {
						data: "unsuccessful" as const,
					},
				);

				// Configure the stub to return the appropriate promise based on the call arguments
				if (
					undefined === success ||
					(angular.isObject(success) &&
						undefined === (success as PromiseMockConfig<T>).args)
				) {
					// No success args specified, so default response is a success
					stub.returns(qSuccess.promise);
				} else {
					stub
						.withArgs(
							sinon.match(
								((success as PromiseMockConfig<T>).args ?? success) as Record<
									string,
									unknown
								>,
							),
						)
						.returns(qSuccess.promise);
				}

				if (undefined !== error) {
					stub
						.withArgs(
							sinon.match(
								((error as PromiseMockConfig<T>).args ?? error) as Record<
									string,
									unknown
								>,
							),
						)
						.returns(qError.promise);
				}

				return stub;
			},
		},
	) {}

	public $get(): QMock {
		// Return the mock $q object
		return this.$q;
	}
}

QMockProvider.$inject = [];
