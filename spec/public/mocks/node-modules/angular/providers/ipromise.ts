import type { Mock } from "~/mocks/types";
import angular from "angular";

export default class IPromiseMockProvider implements Mock<angular.IPromise<never>> {
	public $get(): angular.IPromise<never> {
		// Return the mock promise object
		return {
			then(): angular.IPromise<never> {
				return this;
			},
			catch(): angular.IPromise<never> {
				return this;
			},
			finally(callback: () => void): angular.IPromise<never> {
				callback();

				return this;
			}
		};
	}
}

// These specs are only here for full coverage
describe("iPromiseMock", (): void => {
	// The object under test
	let iPromiseMock: angular.IPromise<never>;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks") as Mocha.HookFunction);

	// Inject the object under test
	beforeEach(angular.mock.inject((_iPromiseMock_: angular.IPromise<never>): angular.IPromise<never> => (iPromiseMock = _iPromiseMock_)) as Mocha.HookFunction);

	describe("then", (): void => {
		it("should return itself", (): Chai.Assertion => iPromiseMock.then().should.equal(iPromiseMock));
	});

	describe("catch", (): void => {
		it("should return itself", (): Chai.Assertion => iPromiseMock.catch().should.equal(iPromiseMock));
	});

	describe("finally", (): void => {
		it("should return itself", (): Chai.Assertion => iPromiseMock.finally((): void => undefined).should.equal(iPromiseMock));
	});
});

IPromiseMockProvider.$inject = [];