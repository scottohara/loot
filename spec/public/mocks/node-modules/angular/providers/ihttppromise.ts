import type { Mock } from "mocks/types";
import angular from "angular";

export default class IHttpPromiseMockProvider implements Mock<angular.IHttpPromise<unknown>> {
	public $get(): angular.IHttpPromise<unknown> {
		// Return the mock HTTP promise object
		return {
			then(): angular.IHttpPromise<unknown> {
				return this;
			},
			catch(): angular.IHttpPromise<unknown> {
				return this;
			},
			finally(callback: () => void): angular.IHttpPromise<unknown> {
				callback();

				return this;
			}
		};
	}
}

// These specs are only here for full coverage
describe("iHttpPromiseMock", (): void => {
	// The object under test
	let iHttpPromiseMock: angular.IHttpPromise<unknown>;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks") as Mocha.HookFunction);

	// Inject the object under test
	beforeEach(angular.mock.inject((_iHttpPromiseMock_: angular.IHttpPromise<unknown>): angular.IHttpPromise<unknown> => (iHttpPromiseMock = _iHttpPromiseMock_)) as Mocha.HookFunction);

	describe("then", (): void => {
		it("should return itself", (): Chai.Assertion => iHttpPromiseMock.then().should.equal(iHttpPromiseMock));
	});

	describe("catch", (): void => {
		it("should return itself", (): Chai.Assertion => iHttpPromiseMock.catch().should.equal(iHttpPromiseMock));
	});

	describe("finally", (): void => {
		it("should return itself", (): Chai.Assertion => iHttpPromiseMock.finally((): void => undefined).should.equal(iHttpPromiseMock));
	});
});

IHttpPromiseMockProvider.$inject = [];