import type { Mock } from "~/mocks/types";
import type { StateMock } from "~/mocks/node-modules/angular/types";
import sinon from "sinon";

export default class StateMockProvider implements Mock<StateMock> {
	// Mock $state object
	public constructor(private readonly $state: StateMock = {
		currentState(state): void {
			this.includes.withArgs(state).returns(true);
		},
		reload: sinon.stub().returns(Promise.resolve()),
		go: sinon.stub().returns(Promise.resolve()),
		includes: sinon.stub().returns(false),
		params: {}
	}) {}

	public $get(): StateMock {
		return this.$state;
	}
}

StateMockProvider.$inject = [];