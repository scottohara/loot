describe("ogTableNavigable", () => {
	let	ogTableNavigable,
			ogTableNavigableService;

	// Load the modules
	beforeEach(module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(inject((directiveTest, _ogTableNavigableService_) => {
		ogTableNavigableService = _ogTableNavigableService_;
		ogTableNavigable = directiveTest;
		ogTableNavigable.configure("og-table-navigable", "table", "<tbody><tr ng-repeat=\"row in rows\"><td></td></tr></tbody>");
		ogTableNavigable.scope.rows = [{}, {}];
		ogTableNavigable.scope.model = {
			selectAction: sinon.stub(),
			cancelAction: sinon.stub(),
			insertAction: sinon.stub(),
			deleteAction: sinon.stub(),
			editAction: sinon.stub(),
			focusAction: sinon.stub()
		};
		ogTableNavigable.compile({"og-table-navigable": "model"});
		ogTableNavigable.scope.$digest();
	}));

	it("should attach a focusRow function to the handlers object", () => ogTableNavigable.scope.model.focusRow.should.be.a.function);

	describe("focusRow", () => {
		let row;

		beforeEach(() => {
			sinon.stub(ogTableNavigable.element.isolateScope(), "highlightRow");
			sinon.stub(ogTableNavigable.element.isolateScope(), "scrollToRow");
			row = $(ogTableNavigable.element).children("tbody").children("tr").last();
		});

		it("should highlight the row", () => {
			ogTableNavigable.element.isolateScope().focusRow(row);
			ogTableNavigable.element.isolateScope().highlightRow.should.have.been.calledWith(row);
		});

		it("should scroll to the row", () => {
			ogTableNavigable.element.isolateScope().focusRow(row);
			ogTableNavigable.element.isolateScope().scrollToRow.should.have.been.calledWith(row);
		});

		it("should store the focussed row index", () => {
			ogTableNavigable.element.isolateScope().focusRow(row);
			ogTableNavigable.element.isolateScope().focussedRow.should.equal(1);
		});

		it("should ignore the focusAction handler if undefined", () => {
			ogTableNavigable.scope.model.focusAction = null;
			ogTableNavigable.element.isolateScope().focusRow(row);

			// Nothing to assert..this spec is only here for full coverage
		});

		it("should invoke the focusAction handler if defined", () => {
			ogTableNavigable.element.isolateScope().focusRow(row);
			ogTableNavigable.scope.model.focusAction.should.have.been.calledWith(1);
		});
	});

	describe("highlightRow", () => {
		let	oldRow,
				newRow;

		beforeEach(() => {
			oldRow = $(ogTableNavigable.element).children("tbody").children("tr").first();
			oldRow.addClass("warning");
			newRow = $(ogTableNavigable.element).children("tbody").children("tr").last();
			ogTableNavigable.element.isolateScope().highlightRow(newRow);
		});

		it("should remove highlighting on the previous row", () => oldRow.hasClass("warning").should.be.false);

		it("should highlight the new row", () => newRow.hasClass("warning").should.be.true);
	});

	describe("scrollToRow", () => {
		let	mockJQueryInstance,
				realJQueryInstance,
				row,
				top;

		beforeEach(() => {
			top = 110;
			row = {
				offset: () => ({top}),
				height: () => 40
			};

			mockJQueryInstance = {
				scrollTop: sinon.stub().returns(100),
				height: sinon.stub().returns(200),
				animate: sinon.stub()
			};

			realJQueryInstance = window.$;
			window.$ = sinon.stub().returns(mockJQueryInstance);
		});

		it("should scroll the page up if the specified row is off the top of the screen", () => {
			top = 50;
			ogTableNavigable.element.isolateScope().scrollToRow(row);
			mockJQueryInstance.animate.should.have.been.calledWith({scrollTop: "+=-50px"}, 200);
		});

		it("should scroll the page down if the specified row is off the bottom of the screen", () => {
			top = 350;
			ogTableNavigable.element.isolateScope().scrollToRow(row);
			mockJQueryInstance.animate.should.have.been.calledWith({scrollTop: "+=90px"}, 200);
		});

		it("should do nothing if the specified row is on screen", () => {
			ogTableNavigable.element.isolateScope().scrollToRow(row);
			mockJQueryInstance.animate.should.not.have.been.called;
		});

		afterEach(() => window.$ = realJQueryInstance);
	});

	describe("jumpToRow", () => {
		let targetRow;
		const matchTargetRow = sinon.match(value => value[0] === targetRow[0]);

		beforeEach(() => sinon.stub(ogTableNavigable.element.isolateScope(), "focusRow"));

		it("should do nothing if there is no focussed row", () => {
			ogTableNavigable.element.isolateScope().focussedRow = null;
			ogTableNavigable.element.isolateScope().jumpToRow(1);
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
		});

		it("should do nothing if the target row could not be determined", () => {
			sinon.stub(ogTableNavigable.element.isolateScope(), "getRows", () => {
				ogTableNavigable.element.isolateScope().getRows.restore();
				return {
					length: 4
				};
			});
			ogTableNavigable.element.isolateScope().focussedRow = 0;
			ogTableNavigable.element.isolateScope().jumpToRow(3);
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
		});

		it("should focus the first row if currently focussed row + offset is less than zero", () => {
			ogTableNavigable.element.isolateScope().focussedRow = 0;
			ogTableNavigable.element.isolateScope().jumpToRow(-10);
			targetRow = $(ogTableNavigable.element).children("tbody").children("tr").first();
			ogTableNavigable.element.isolateScope().focusRow.should.have.been.calledWith(matchTargetRow);
		});

		it("should focus the last row if the currently focussed row + offset is greater than the number of rows", () => {
			ogTableNavigable.element.isolateScope().focussedRow = 1;
			ogTableNavigable.element.isolateScope().jumpToRow(10);
			targetRow = $(ogTableNavigable.element).children("tbody").children("tr").last();
			ogTableNavigable.element.isolateScope().focusRow.should.have.been.calledWith(matchTargetRow);
		});

		it("should focus the currently focussed row + offset if within the bounds of the table", () => {
			ogTableNavigable.element.isolateScope().focussedRow = 1;
			ogTableNavigable.element.isolateScope().jumpToRow(-1);
			targetRow = $(ogTableNavigable.element).children("tbody").children("tr").first();
			ogTableNavigable.element.isolateScope().focusRow.should.have.been.calledWith(matchTargetRow);
		});
	});

	describe("clickHandler", () => {
		beforeEach(() => sinon.stub(ogTableNavigable.element.isolateScope(), "focusRow"));

		it("should do nothing when navigation is disabled", () => {
			ogTableNavigableService.enabled = false;
			ogTableNavigable.element.isolateScope().clickHandler();
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", () => {
			ogTableNavigable.element.isolateScope().clickHandler({});
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
		});

		it("should focus the closest parent TR element to where the event occurred", () => {
			const cellInLastRow = $(ogTableNavigable.element).find("tbody > tr > td").last(),
						lastRow = $(cellInLastRow).closest("[og-table-navigable] > tbody > tr");

			ogTableNavigable.element.isolateScope().clickHandler({target: cellInLastRow});
			ogTableNavigable.element.isolateScope().focusRow.should.have.been.calledWith(lastRow);
		});
	});

	describe("doubleClickHandler", () => {
		it("should do nothing when navigation is disabled", () => {
			ogTableNavigableService.enabled = false;
			ogTableNavigable.element.isolateScope().doubleClickHandler();
			ogTableNavigable.scope.model.selectAction.should.not.have.been.called;
		});

		it("should do nothing if a selectAction hander is not defined", () => {
			ogTableNavigable.scope.model.selectAction = null;
			ogTableNavigable.element.isolateScope().doubleClickHandler();

			// Nothing to assert..this spec is only here for full coverage
		});

		it("should do nothing if the event was triggered by a button click", () => {
			ogTableNavigable.element.isolateScope().doubleClickHandler({target: {localName: "button"}});
			ogTableNavigable.scope.model.selectAction.should.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", () => {
			ogTableNavigable.element.isolateScope().doubleClickHandler({target: {localName: "td"}});
			ogTableNavigable.scope.model.selectAction.should.not.have.been.called;
		});

		it("should invoke the selectAction handler for the closest parent TR element to where the event occurred", () => {
			const cellInLastRow = $(ogTableNavigable.element).find("tbody > tr > td").last();

			ogTableNavigable.element.isolateScope().doubleClickHandler({target: cellInLastRow});
			ogTableNavigable.scope.model.selectAction.should.have.been.calledWith(1);
		});
	});

	describe("handlers.focusRow", () => {
		let lastRow;
		const matchLastRow = sinon.match(value => value[0] === lastRow[0]);

		beforeEach(() => {
			sinon.stub(ogTableNavigable.element.isolateScope(), "focusRow");
			sinon.stub(ogTableNavigable.element.isolateScope(), "highlightRow");
			ogTableNavigable.element.isolateScope().focussedRow = 0;
			lastRow = $(ogTableNavigable.element).children("tbody").children("tr").last();
		});

		it("should do nothing if the target row could not be determined", () => {
			ogTableNavigable.element.isolateScope().handlers.focusRow(3);
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
			ogTableNavigable.element.isolateScope().highlightRow.should.not.have.been.called;
		});

		it("should focus the target row if not already focussed", () => {
			ogTableNavigable.element.isolateScope().handlers.focusRow(1);
			ogTableNavigable.element.isolateScope().focusRow.should.have.been.calledWith(matchLastRow);
			ogTableNavigable.element.isolateScope().highlightRow.should.not.have.been.called;
		});

		it("should highlight the target row if already focussed", () => {
			ogTableNavigable.element.isolateScope().focussedRow = 1;
			ogTableNavigable.element.isolateScope().handlers.focusRow(1);
			ogTableNavigable.element.isolateScope().focusRow.should.not.have.been.called;
			ogTableNavigable.element.isolateScope().highlightRow.should.have.been.calledWith(matchLastRow);
		});
	});

	describe("keyHandler", () => {
		const	TEST_MOVEMENT_KEYS = [
						{code: 33, name: "page up", amount: -10},
						{code: 34, name: "page down", amount: 10},
						{code: 38, name: "arrow up", amount: -1},
						{code: 40, name: "arrow down", amount: 1},
						{code: 74, name: "J", amount: 1},
						{code: 75, name: "K", amount: -1}
					],
					TEST_ACTION_KEYS = [
						{code: 8, name: "Backspace", handler: "deleteAction"},
						{code: 13, name: "Enter", handler: "selectAction"},
						{code: 27, name: "Esc", handler: "cancelAction"},
						{code: 45, name: "Insert", handler: "insertAction"},
						{code: 46, name: "Delete", handler: "deleteAction"},
						{code: 69, ctrl: true, name: "CTRL+E", handler: "editAction"},
						{code: 78, ctrl: true, name: "CTRL+N", handler: "insertAction"}
					];

		let event;

		beforeEach(() => {
			event = {
				keyCode: 13,
				preventDefault: sinon.stub()
			};
			sinon.stub(ogTableNavigable.element.isolateScope(), "jumpToRow");
			ogTableNavigable.element.isolateScope().focussedRow = 1;
		});

		it("should do nothing when navigation is disabled", () => {
			ogTableNavigableService.enabled = false;
			ogTableNavigable.element.isolateScope().keyHandler(event);
			ogTableNavigable.scope.model.selectAction.should.not.have.been.called;
		});

		TEST_MOVEMENT_KEYS.forEach(key => {
			it(`should jump ${key.amount < 0 ? "up" : "down"} ${Math.abs(key.amount)} row${1 === Math.abs(key.amount) ? "" : "s"} when the ${key.name} key is pressed`, () => {
				event.keyCode = key.code;
				ogTableNavigable.element.isolateScope().keyHandler(event);
				ogTableNavigable.element.isolateScope().jumpToRow.should.have.been.calledWith(key.amount);
				event.preventDefault.should.have.been.called;
			});
		});

		TEST_ACTION_KEYS.forEach(key => {
			it(`should do nothing when the ${key.name} key${key.ctrl ? "s are" : " is"} pressed and a ${key.handler} handler is not defined`, () => {
				event.keyCode = key.code;
				event.ctrlKey = key.ctrl;
				ogTableNavigable.scope.model[key.handler] = null;
				ogTableNavigable.compile({"og-table-navigable": "model"});
				ogTableNavigable.scope.$digest();
				sinon.stub(ogTableNavigable.element.isolateScope(), "jumpToRow");
				ogTableNavigable.element.isolateScope().focussedRow = 1;
				ogTableNavigable.element.isolateScope().keyHandler(event);
				event.preventDefault.should.have.been.called;
			});

			it(`should invoke the defined ${key.handler} handler when the ${key.name} key${key.ctrl ? "s are" : " is"} pressed`, () => {
				event.keyCode = key.code;
				event.ctrlKey = key.ctrl;
				ogTableNavigable.element.isolateScope().keyHandler(event);
				ogTableNavigable.scope.model[key.handler].should.have.been.calledWith(1);
				event.preventDefault.should.have.been.called;
			});
		});
	});

	it("should attach a click handler to the element", () => {
		sinon.stub(ogTableNavigable.element.isolateScope(), "clickHandler");
		ogTableNavigable.element.triggerHandler("click");
		ogTableNavigable.element.isolateScope().clickHandler.should.have.been.called;
	});

	it("should attach a double-click handler to the element", () => {
		sinon.stub(ogTableNavigable.element.isolateScope(), "doubleClickHandler");
		ogTableNavigable.element.triggerHandler("dblclick");
		ogTableNavigable.element.isolateScope().doubleClickHandler.should.have.been.called;
	});

	it("should attach a keydown handler to the document", () => {
		sinon.stub(ogTableNavigable.element.isolateScope(), "keyHandler");
		$(document).triggerHandler("keydown");
		ogTableNavigable.element.isolateScope().keyHandler.should.have.been.called;
	});

	describe("on destroy", () => {
		beforeEach(() => {
			sinon.stub(ogTableNavigable.element.isolateScope(), "clickHandler");
			sinon.stub(ogTableNavigable.element.isolateScope(), "doubleClickHandler");
			sinon.stub(ogTableNavigable.element.isolateScope(), "keyHandler");
			ogTableNavigable.element.triggerHandler("$destroy");
		});

		it("should remove the click handler from the element", () => {
			ogTableNavigable.element.triggerHandler("click");
			ogTableNavigable.element.isolateScope().clickHandler.should.not.have.been.called;
		});

		it("should remove the double-click handler from the element", () => {
			ogTableNavigable.element.triggerHandler("dblclick");
			ogTableNavigable.element.isolateScope().doubleClickHandler.should.not.have.been.called;
		});

		it("should remove the keydown handler from the element", () => {
			$(document).triggerHandler("keydown");
			ogTableNavigable.element.isolateScope().keyHandler.should.not.have.been.called;
		});
	});
});
