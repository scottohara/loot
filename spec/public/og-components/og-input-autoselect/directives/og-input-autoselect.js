import angular from "angular";

describe("ogInputAutoselect", () => {
	let	ogInputAutoselect,
			$window,
			$timeout,
			mockJQueryInstance,
			realJQueryInstance;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject((_$window_, _$timeout_, directiveTest) => {
		$window = _$window_;
		$timeout = _$timeout_;
		ogInputAutoselect = directiveTest;
		ogInputAutoselect.configure("og-input-autoselect", "input");
		ogInputAutoselect.compile();

		mockJQueryInstance = {
			select: sinon.stub()
		};

		realJQueryInstance = $window.$;
		$window.$ = sinon.stub();
		$window.$.withArgs(sinon.match(value => value[0] === ogInputAutoselect.element[0])).returns(mockJQueryInstance);
	}));

	describe("isFocussed", () => {
		beforeEach(() => $timeout.flush());

		it("should be true if the passed element is the document's active element", () => {
			ogInputAutoselect.scope.isFocussed(document.activeElement).should.be.true;
		});

		it("should be false if the element is not the document's active element", () => {
			ogInputAutoselect.scope.isFocussed().should.be.false;
		});
	});

	describe("on focus", () => {
		it("should select the input value if the element has focus", () => {
			sinon.stub(ogInputAutoselect.scope, "isFocussed").returns(true);
			ogInputAutoselect.element.triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.have.been.called;
		});

		it("should not select the input value if the element does not have focus", () => {
			sinon.stub(ogInputAutoselect.scope, "isFocussed").returns(false);
			ogInputAutoselect.element.triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.not.have.been.called;
		});
	});

	describe("on destroy", () => {
		beforeEach(() => {
			ogInputAutoselect.element.triggerHandler("$destroy");
			ogInputAutoselect.scope.$digest();
		});

		it("should remove the focus handler from the element", () => {
			sinon.stub(ogInputAutoselect.scope, "isFocussed").returns(true);
			ogInputAutoselect.element.triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.not.have.been.called;
		});
	});

	afterEach(() => {
		$timeout.verifyNoPendingTasks();
		$window.$ = realJQueryInstance;
	});
});
