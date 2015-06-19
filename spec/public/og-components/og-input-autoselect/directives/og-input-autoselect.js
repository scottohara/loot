describe("ogInputAutoselect", () => {
	let	ogInputAutoselect,
			$timeout,
			mockJQueryInstance,
			realJQueryInstance;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject((_$timeout_, directiveTest) => {
		$timeout = _$timeout_;
		ogInputAutoselect = directiveTest;
		ogInputAutoselect.configure("og-input-autoselect", "input");
		ogInputAutoselect.compile();

		mockJQueryInstance = {
			select: sinon.stub()
		};

		realJQueryInstance = window.$;
		window.$ = sinon.stub();
		window.$.withArgs(sinon.match(value => value[0] === ogInputAutoselect.element[0])).returns(mockJQueryInstance);
	}));

	describe("on focus", () => {
		beforeEach(() => {
			ogInputAutoselect.element.triggerHandler("focus");
			$timeout.flush();
		});

		it("should select the input value", () => mockJQueryInstance.select.should.have.been.called);
	});

	describe("on destroy", () => {
		beforeEach(() => {
			ogInputAutoselect.element.triggerHandler("$destroy");
			ogInputAutoselect.scope.$digest();
		});

		it("should remove the focus handler from the element", () => {
			ogInputAutoselect.element.triggerHandler("focus");
			$timeout.flush();
			mockJQueryInstance.select.should.not.have.been.called;
		});
	});

	afterEach(() => {
		$timeout.verifyNoPendingTasks();
		window.$ = realJQueryInstance;
	});
});
