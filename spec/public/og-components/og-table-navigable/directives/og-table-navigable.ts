import {
	JQueryKeyEventObjectMock,
	JQueryMouseEventObjectMock
} from "mocks/types";
import {
	OgTableActionHandlers,
	OgTableActions,
	OgTableNavigableScope
} from "og-components/og-table-navigable/types";
import sinon, {
	SinonMatcher,
	SinonStub
} from "sinon";
import DirectiveTest from "mocks/loot/directivetest";
import OgTableNavigableService from "og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";

describe("ogTableNavigable", (): void => {
	let	ogTableNavigable: DirectiveTest,
			ogTableNavigableService: OgTableNavigableService,
			$window: angular.IWindowService,
			scope: OgTableNavigableScope & {rows: {}[]; model: OgTableActions;},
			isolateScope: OgTableNavigableScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents"));

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, directiveTest: DirectiveTest, _ogTableNavigableService_: OgTableNavigableService): void => {
		$window = _$window_;
		ogTableNavigableService = _ogTableNavigableService_;
		ogTableNavigable = directiveTest;
		ogTableNavigable.configure("og-table-navigable", "table", "<tbody><tr ng-repeat=\"row in rows\"><td></td></tr></tbody>");
		scope = ogTableNavigable.scope as OgTableNavigableScope & {rows: {}[]; model: OgTableActions;};
		scope.rows = [{}, {}];
		scope.model = {
			selectAction: sinon.stub(),
			cancelAction: sinon.stub(),
			insertAction: sinon.stub(),
			deleteAction: sinon.stub(),
			editAction: sinon.stub(),
			focusAction: sinon.stub()
		};
		ogTableNavigable.compile({ "og-table-navigable": "model" });
		ogTableNavigable.scope.$digest();
		isolateScope = ogTableNavigable["element"].isolateScope();
	}));

	it("should attach a focusRow function to the handlers object", (): Chai.Assertion => (scope.model as OgTableActionHandlers).focusRow.should.be.a("function"));

	describe("focusRow", (): void => {
		let row: JQuery<Element>;

		beforeEach((): void => {
			sinon.stub(isolateScope, "highlightRow");
			sinon.stub(isolateScope, "scrollToRow");
			row = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last();
		});

		it("should highlight the row", (): void => {
			isolateScope.focusRow(row);
			isolateScope.highlightRow.should.have.been.calledWith(row);
		});

		it("should scroll to the row", (): void => {
			isolateScope.focusRow(row);
			isolateScope.scrollToRow.should.have.been.calledWith(row);
		});

		it("should store the focussed row index", (): void => {
			isolateScope.focusRow(row);
			Number(isolateScope.focussedRow).should.equal(1);
		});

		it("should ignore the focusAction handler if undefined", (): void => {
			delete scope.model.focusAction;
			isolateScope.focusRow(row);

			// Nothing to assert..this spec is only here for full coverage
		});

		it("should invoke the focusAction handler if defined", (): void => {
			isolateScope.focusRow(row);
			scope.model.focusAction.should.have.been.calledWith(1);
		});
	});

	describe("highlightRow", (): void => {
		let	oldRow: JQuery<Element>,
				newRow: JQuery<Element>;

		beforeEach((): void => {
			oldRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first();
			oldRow.addClass("warning");
			newRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last();
			isolateScope.highlightRow(newRow);
		});

		it("should remove highlighting on the previous row", (): Chai.Assertion => oldRow.hasClass("warning").should.be.false);

		it("should highlight the new row", (): Chai.Assertion => newRow.hasClass("warning").should.be.true);
	});

	describe("scrollToRow", (): void => {
		let	mockJQueryInstance: {scrollTop: SinonStub; height: SinonStub;},
				realJQueryInstance: JQuery,
				row: JQuery<Element>,
				top: number;

		beforeEach((): void => {
			top = 110;
			row = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first();
			sinon.stub(row[0], "scrollIntoView");
			sinon.stub(row, "offset").callsFake((): JQuery.Coordinates => ({ top, left: 0 }));
			sinon.stub(row, "height").returns(40);

			mockJQueryInstance = {
				scrollTop: sinon.stub().returns(100),
				height: sinon.stub().returns(200)
			};

			realJQueryInstance = $window.$;
			$window.$ = sinon.stub().returns(mockJQueryInstance);
		});

		it("should scroll the page up if the specified row is off the top of the screen", (): void => {
			top = 50;
			isolateScope.scrollToRow(row);
			row[0].scrollIntoView.should.have.been.calledWith({ behavior: "smooth" });
		});

		it("should scroll the page down if the specified row is off the bottom of the screen", (): void => {
			top = 350;
			isolateScope.scrollToRow(row);
			row[0].scrollIntoView.should.have.been.calledWith({ behavior: "smooth" });
		});

		it("should do nothing if the specified row is on screen", (): void => {
			isolateScope.scrollToRow(row);
			row[0].scrollIntoView.should.not.have.been.called;
		});

		it("should do nothing if the specified row offset can't be determined", (): void => {
			(row.offset as SinonStub).restore();
			sinon.stub(row, "offset").returns(undefined);
			isolateScope.scrollToRow(row);
			row[0].scrollIntoView.should.not.have.been.called;
		});

		afterEach((): JQuery => ($window.$ = realJQueryInstance));
	});

	describe("jumpToRow", (): void => {
		let targetRow: JQuery<Element>;
		const matchTargetRow: SinonMatcher	= sinon.match((value: JQuery<Element>): boolean => value[0] === targetRow[0]);

		beforeEach((): SinonStub => sinon.stub(isolateScope, "focusRow"));

		it("should do nothing if there is no focussed row", (): void => {
			isolateScope.focussedRow = null;
			isolateScope.jumpToRow(1);
			isolateScope.focusRow.should.not.have.been.called;
		});

		it("should do nothing if the target row could not be determined", (): void => {
			(sinon.stub(isolateScope, "getRows") as SinonStub).callsFake((): {length: number;} => {
				(isolateScope.getRows as SinonStub).restore();

				return {
					length: 4
				};
			});
			isolateScope.focussedRow = 0;
			isolateScope.jumpToRow(3);
			isolateScope.focusRow.should.not.have.been.called;
		});

		it("should focus the first row if currently focussed row + offset is less than zero", (): void => {
			isolateScope.focussedRow = 0;
			isolateScope.jumpToRow(-10);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first();
			isolateScope.focusRow.should.have.been.calledWith(matchTargetRow);
		});

		it("should focus the last row if the currently focussed row + offset is greater than the number of rows", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.jumpToRow(10);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last();
			isolateScope.focusRow.should.have.been.calledWith(matchTargetRow);
		});

		it("should focus the currently focussed row + offset if within the bounds of the table", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.jumpToRow(-1);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first();
			isolateScope.focusRow.should.have.been.calledWith(matchTargetRow);
		});
	});

	describe("clickHandler", (): void => {
		const event: JQueryMouseEventObjectMock = {};

		beforeEach((): SinonStub => sinon.stub(isolateScope, "focusRow"));

		it("should do nothing when navigation is disabled", (): void => {
			ogTableNavigableService.enabled = false;
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			isolateScope.focusRow.should.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", (): void => {
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			isolateScope.focusRow.should.not.have.been.called;
		});

		it("should focus the closest parent TR element to where the event occurred", (): void => {
			const cellInLastRow: Element = $window.$(ogTableNavigable["element"]).find("tbody > tr > td").last(),
						lastRow: JQuery<Element> = $window.$(cellInLastRow).closest("[og-table-navigable] > tbody > tr");

			event.target = cellInLastRow;
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			isolateScope.focusRow.should.have.been.calledWith(lastRow);
		});
	});

	describe("doubleClickHandler", (): void => {
		const event: JQueryMouseEventObjectMock = {};

		it("should do nothing when navigation is disabled", (): void => {
			ogTableNavigableService.enabled = false;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			scope.model.selectAction.should.not.have.been.called;
		});

		it("should do nothing if a selectAction hander is not defined", (): void => {
			delete scope.model.selectAction;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);

			// Nothing to assert..this spec is only here for full coverage
		});

		it("should do nothing if the event was triggered by a button click", (): void => {
			event.target = { localName: "button" } as Element;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			scope.model.selectAction.should.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", (): void => {
			event.target = { localName: "td" } as Element;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			scope.model.selectAction.should.not.have.been.called;
		});

		it("should invoke the selectAction handler for the closest parent TR element to where the event occurred", (): void => {
			event.target = $window.$(ogTableNavigable["element"]).find("tbody > tr > td").last();
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			scope.model.selectAction.should.have.been.calledWith(1);
		});
	});

	describe("handlers.focusRow", (): void => {
		let lastRow: JQuery<Element>;
		const matchLastRow: SinonMatcher = sinon.match((value: JQuery<Element>): boolean => value[0] === lastRow[0]);

		beforeEach((): void => {
			sinon.stub(isolateScope, "focusRow");
			sinon.stub(isolateScope, "highlightRow");
			isolateScope.focussedRow = 0;
			lastRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last();
		});

		it("should do nothing if the target row could not be determined", (): void => {
			isolateScope.handlers.focusRow(3);
			isolateScope.focusRow.should.not.have.been.called;
			isolateScope.highlightRow.should.not.have.been.called;
		});

		it("should focus the target row if not already focussed", (): void => {
			isolateScope.handlers.focusRow(1);
			isolateScope.focusRow.should.have.been.calledWith(matchLastRow);
			isolateScope.highlightRow.should.not.have.been.called;
		});

		it("should highlight the target row if already focussed", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.handlers.focusRow(1);
			isolateScope.focusRow.should.not.have.been.called;
			isolateScope.highlightRow.should.have.been.calledWith(matchLastRow);
		});
	});

	describe("keyHandler", (): void => {
		const	TEST_MOVEMENT_KEYS: {code: number; name: string; amount: number;}[] = [
						{ code: 33, name: "page up", amount: -10 },
						{ code: 34, name: "page down", amount: 10 },
						{ code: 38, name: "arrow up", amount: -1 },
						{ code: 40, name: "arrow down", amount: 1 },
						{ code: 74, name: "J", amount: 1 },
						{ code: 75, name: "K", amount: -1 }
					],
					TEST_ACTION_KEYS: {code: number; ctrl?: boolean; name: string; handler: string;}[] = [
						{ code: 8, name: "Backspace", handler: "deleteAction" },
						{ code: 13, name: "Enter", handler: "selectAction" },
						{ code: 27, name: "Esc", handler: "cancelAction" },
						{ code: 45, name: "Insert", handler: "insertAction" },
						{ code: 46, name: "Delete", handler: "deleteAction" },
						{ code: 69, ctrl: true, name: "CTRL+E", handler: "editAction" },
						{ code: 78, ctrl: true, name: "CTRL+N", handler: "insertAction" }
					];

		let event: JQueryKeyEventObjectMock;

		beforeEach((): void => {
			event = {
				keyCode: 13,
				preventDefault: sinon.stub()
			};
			sinon.stub(isolateScope, "jumpToRow");
			isolateScope.focussedRow = 1;
		});

		it("should do nothing when navigation is disabled", (): void => {
			ogTableNavigableService.enabled = false;
			isolateScope.keyHandler(event as JQueryKeyEventObject);
			scope.model.selectAction.should.not.have.been.called;
		});

		TEST_MOVEMENT_KEYS.forEach((key: {code: number; name: string; amount: number;}): void => {
			it(`should jump ${key.amount < 0 ? "up" : "down"} ${Math.abs(key.amount)} row${1 === Math.abs(key.amount) ? "" : "s"} when the ${key.name} key is pressed`, (): void => {
				event.keyCode = key.code;
				isolateScope.keyHandler(event as JQueryKeyEventObject);
				isolateScope.jumpToRow.should.have.been.calledWith(key.amount);
				(event.preventDefault as SinonStub).should.have.been.called;
			});
		});

		TEST_ACTION_KEYS.forEach((key: {code: number; ctrl?: boolean; name: string; handler: string;}): void => {
			it(`should do nothing when the ${key.name} key${undefined === key.ctrl ? " is" : "s are"} pressed and a ${key.handler} handler is not defined`, (): void => {
				event.keyCode = key.code;
				event.ctrlKey = key.ctrl;
				scope.model[key.handler] = undefined;
				ogTableNavigable.compile({ "og-table-navigable": "model" });
				ogTableNavigable.scope.$digest();
				isolateScope = ogTableNavigable["element"].isolateScope();
				sinon.stub(isolateScope, "jumpToRow");
				isolateScope.focussedRow = 1;
				isolateScope.keyHandler(event as JQueryKeyEventObject);
				(event.preventDefault as SinonStub).should.have.been.called;
			});

			it(`should invoke the defined ${key.handler} handler when the ${key.name} key${undefined === key.ctrl ? " is" : "s are"} pressed`, (): void => {
				event.keyCode = key.code;
				event.ctrlKey = key.ctrl;
				isolateScope.keyHandler(event as JQueryKeyEventObject);
				(scope.model[key.handler] as SinonStub).should.have.been.calledWith(1);
				(event.preventDefault as SinonStub).should.have.been.called;
			});
		});
	});

	it("should attach a click handler to the element", (): void => {
		sinon.stub(isolateScope, "clickHandler");
		ogTableNavigable["element"].triggerHandler("click");
		isolateScope.clickHandler.should.have.been.called;
	});

	it("should attach a double-click handler to the element", (): void => {
		sinon.stub(isolateScope, "doubleClickHandler");
		ogTableNavigable["element"].triggerHandler("dblclick");
		isolateScope.doubleClickHandler.should.have.been.called;
	});

	it("should attach a keydown handler to the document", (): void => {
		sinon.stub(isolateScope, "keyHandler");
		$window.$(document).triggerHandler("keydown");
		isolateScope.keyHandler.should.have.been.called;
	});

	describe("on destroy", (): void => {
		beforeEach((): void => {
			sinon.stub(isolateScope, "clickHandler");
			sinon.stub(isolateScope, "doubleClickHandler");
			sinon.stub(isolateScope, "keyHandler");
			ogTableNavigable["element"].triggerHandler("$destroy");
		});

		it("should remove the click handler from the element", (): void => {
			ogTableNavigable["element"].triggerHandler("click");
			isolateScope.clickHandler.should.not.have.been.called;
		});

		it("should remove the double-click handler from the element", (): void => {
			ogTableNavigable["element"].triggerHandler("dblclick");
			isolateScope.doubleClickHandler.should.not.have.been.called;
		});

		it("should remove the keydown handler from the element", (): void => {
			$window.$(document).triggerHandler("keydown");
			isolateScope.keyHandler.should.not.have.been.called;
		});
	});
});
