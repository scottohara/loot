import type DirectiveTest from "~/mocks/loot/directivetest";
import type { OgInputAutoSelectScope } from "~/og-components/og-input-autoselect/types";
import type { SinonStub } from "sinon";
import angular from "angular";
import sinon from "sinon";

describe("ogInputAutoselect", (): void => {
	let	ogInputAutoselect: DirectiveTest,
			$window: angular.IWindowService,
			$timeout: angular.ITimeoutService,
			mockJqueryInstance: { select: SinonStub; },
			realJqueryInstance: JQuery,
			scope: OgInputAutoSelectScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, _$timeout_: angular.ITimeoutService, directiveTest: DirectiveTest): void => {
		$window = _$window_;
		$timeout = _$timeout_;
		ogInputAutoselect = directiveTest;
		ogInputAutoselect.configure("og-input-autoselect", "input");
		ogInputAutoselect.compile();
		scope = ogInputAutoselect.scope as OgInputAutoSelectScope;

		mockJqueryInstance = {
			select: sinon.stub()
		};

		realJqueryInstance = $window.$ as JQuery;
		$window.$ = sinon.stub();
		$window.$.withArgs(sinon.match((value: JQuery<Element>): boolean => value[0] === ogInputAutoselect["element"][0])).returns(mockJqueryInstance);
	}) as Mocha.HookFunction);

	describe("isFocussed", (): void => {
		beforeEach((): void => $timeout.flush());

		it("should be true if the passed element is the document's active element", (): Chai.Assertion => expect(scope.isFocussed(document.activeElement as Element)).to.be.true);

		it("should be false if the element is not the document's active element", (): Chai.Assertion => expect(scope.isFocussed()).to.be.false);
	});

	describe("on focus", (): void => {
		it("should select the input value if the element has focus", (): void => {
			sinon.stub(scope, "isFocussed").returns(true);
			ogInputAutoselect["element"].triggerHandler("focus");
			$timeout.flush();
			expect(mockJqueryInstance.select).to.have.been.called;
		});

		it("should not select the input value if the element does not have focus", (): void => {
			sinon.stub(scope, "isFocussed").returns(false);
			ogInputAutoselect["element"].triggerHandler("focus");
			$timeout.flush();
			expect(mockJqueryInstance.select).to.not.have.been.called;
		});
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			ogInputAutoselect["element"].triggerHandler("$destroy");
			ogInputAutoselect.scope.$digest();
		});

		it("should remove the focus handler from the element", (): void => {
			sinon.stub(scope, "isFocussed").returns(true);
			ogInputAutoselect["element"].triggerHandler("focus");
			$timeout.flush();
			expect(mockJqueryInstance.select).to.not.have.been.called;
		});
	});

	afterEach((): void => {
		$timeout.verifyNoPendingTasks();
		$window.$ = realJqueryInstance;
	});
});
