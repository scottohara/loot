import sinon, {SinonStub} from "sinon";
import DirectiveTest from "mocks/loot/directivetest";
import {OgInputAutoSelectScope} from "og-components/og-input-autoselect/types";
import angular from "angular";

describe("ogInputAutoselect", (): void => {
	let	ogInputAutoselect: DirectiveTest,
			$window: angular.IWindowService,
			$timeout: angular.ITimeoutService,
			mockJQueryInstance: {select: SinonStub;},
			realJQueryInstance: JQuery,
			scope: OgInputAutoSelectScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, _$timeout_: angular.ITimeoutService, directiveTest: DirectiveTest): void => {
		$window = _$window_;
		$timeout = _$timeout_;
		ogInputAutoselect = directiveTest;
		ogInputAutoselect.configure("og-input-autoselect", "input");
		ogInputAutoselect.compile();
		scope = ogInputAutoselect.scope as OgInputAutoSelectScope;

		mockJQueryInstance = {
			select: sinon.stub()
		};

		realJQueryInstance = $window.$;
		$window.$ = sinon.stub();
		$window.$.withArgs(sinon.match((value: JQuery<Element>): boolean => value[0] === ogInputAutoselect["element"][0])).returns(mockJQueryInstance);
	}));

	describe("isFocussed", (): void => {
		beforeEach((): void => $timeout.flush());

		it("should be true if the passed element is the document's active element", (): Chai.Assertion => scope.isFocussed(document.activeElement as Element).should.be.true);

		it("should be false if the element is not the document's active element", (): Chai.Assertion => scope.isFocussed().should.be.false);
	});

	describe("on focus", (): void => {
		it("should select the input value if the element has focus", (): void => {
			sinon.stub(scope, "isFocussed").returns(true);
			ogInputAutoselect["element"].triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.have.been.called;
		});

		it("should not select the input value if the element does not have focus", (): void => {
			sinon.stub(scope, "isFocussed").returns(false);
			ogInputAutoselect["element"].triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.not.have.been.called;
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
			mockJQueryInstance.select.should.not.have.been.called;
		});
	});

	afterEach((): void => {
		$timeout.verifyNoPendingTasks();
		$window.$ = realJQueryInstance;
	});
});
