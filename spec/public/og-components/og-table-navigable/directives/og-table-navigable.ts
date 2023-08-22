import type {
	JQueryKeyEventObjectMock,
	JQueryMouseEventObjectMock
} from "~/mocks/types";
import type {
	OgTableActionHandlers,
	OgTableActions,
	OgTableNavigableScope
} from "~/og-components/og-table-navigable/types";
import type {
	SinonMatcher,
	SinonStub
} from "sinon";
import type DirectiveTest from "~/mocks/loot/directivetest";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";
import sinon from "sinon";

describe("ogTableNavigable", (): void => {
	let	ogTableNavigable: DirectiveTest,
			ogTableNavigableService: OgTableNavigableService,
			$window: angular.IWindowService,
			scope: OgTableNavigableScope & { rows: Record<string, unknown>[]; model: OgTableActions; },
			isolateScope: OgTableNavigableScope;

	// Load the modules
	beforeEach(angular.mock.module("lootMocks", "ogComponents") as Mocha.HookFunction);

	// Configure & compile the object under test
	beforeEach(angular.mock.inject((_$window_: angular.IWindowService, directiveTest: DirectiveTest, _ogTableNavigableService_: OgTableNavigableService): void => {
		$window = _$window_;
		ogTableNavigableService = _ogTableNavigableService_;
		ogTableNavigable = directiveTest;
		ogTableNavigable.configure("og-table-navigable", "table", "<tbody><tr ng-repeat=\"row in rows\"><td></td></tr></tbody>");
		scope = ogTableNavigable.scope as OgTableNavigableScope & { rows: Record<string, unknown>[]; model: OgTableActions; };
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
	}) as Mocha.HookFunction);

	it("should attach a focusRow function to the handlers object", (): Chai.Assertion => expect((scope.model as OgTableActionHandlers).focusRow).to.be.a("function"));

	describe("focusRow", (): void => {
		let row: JQuery<Element>;

		beforeEach((): void => {
			sinon.stub(isolateScope, "highlightRow");
			sinon.stub(isolateScope, "scrollToRow");
			row = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last() as JQuery<Element>;
		});

		it("should highlight the row", (): void => {
			isolateScope.focusRow(row);
			expect(isolateScope.highlightRow).to.have.been.calledWith(row);
		});

		it("should scroll to the row", (): void => {
			isolateScope.focusRow(row);
			expect(isolateScope.scrollToRow).to.have.been.calledWith(row);
		});

		it("should store the focussed row index", (): void => {
			isolateScope.focusRow(row);
			expect(Number(isolateScope.focussedRow)).to.equal(1);
		});

		it("should invoke the focusAction handler", (): void => {
			isolateScope.focusRow(row);
			expect(scope.model.focusAction).to.have.been.calledWith(1);
		});
	});

	describe("highlightRow", (): void => {
		let	oldRow: JQuery<Element>,
				newRow: JQuery<Element>;

		beforeEach((): void => {
			oldRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first() as JQuery<Element>;
			oldRow.addClass("warning");
			newRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last() as JQuery<Element>;
			isolateScope.highlightRow(newRow);
		});

		it("should remove highlighting on the previous row", (): Chai.Assertion => expect(oldRow.hasClass("warning")).to.be.false);

		it("should highlight the new row", (): Chai.Assertion => expect(newRow.hasClass("warning")).to.be.true);
	});

	describe("scrollToRow", (): void => {
		let	mockJqueryInstance: { scrollTop: SinonStub; height: SinonStub; },
				realJqueryInstance: JQuery,
				row: JQuery<Element>,
				top: number;

		beforeEach((): void => {
			top = 110;
			row = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first() as JQuery<Element>;
			sinon.stub(row[0], "scrollIntoView");
			sinon.stub(row, "offset").callsFake((): JQuery.Coordinates => ({ top, left: 0 }));
			sinon.stub(row, "height").returns(40);

			mockJqueryInstance = {
				scrollTop: sinon.stub().returns(100),
				height: sinon.stub().returns(200)
			};

			realJqueryInstance = $window.$ as JQuery;
			$window.$ = sinon.stub().returns(mockJqueryInstance);
		});

		it("should scroll the page up if the specified row is off the top of the screen", (): void => {
			top = 50;
			isolateScope.scrollToRow(row);
			expect(row[0]["scrollIntoView"]).to.have.been.calledWith({ behavior: "smooth" });
		});

		it("should scroll the page down if the specified row is off the bottom of the screen", (): void => {
			top = 350;
			isolateScope.scrollToRow(row);
			expect(row[0]["scrollIntoView"]).to.have.been.calledWith({ behavior: "smooth" });
		});

		it("should do nothing if the specified row is on screen", (): void => {
			isolateScope.scrollToRow(row);
			expect(row[0]["scrollIntoView"]).to.not.have.been.called;
		});

		it("should do nothing if the specified row offset can't be determined", (): void => {
			(row.offset as SinonStub).restore();
			sinon.stub(row, "offset").returns(undefined);
			isolateScope.scrollToRow(row);
			expect(row[0]["scrollIntoView"]).to.not.have.been.called;
		});

		afterEach((): JQuery => ($window.$ = realJqueryInstance));
	});

	describe("jumpToRow", (): void => {
		let targetRow: JQuery<Element>;
		const matchTargetRow: SinonMatcher	= sinon.match((value: JQuery<Element>): boolean => value[0] === targetRow[0]);

		beforeEach((): SinonStub => sinon.stub(isolateScope, "focusRow"));

		it("should do nothing if there is no focussed row", (): void => {
			isolateScope.focussedRow = null;
			isolateScope.jumpToRow(1);
			expect(isolateScope.focusRow).to.not.have.been.called;
		});

		it("should do nothing if the target row could not be determined", (): void => {
			(sinon.stub(isolateScope, "getRows") as SinonStub).callsFake((): { length: number; } => {
				(isolateScope.getRows as SinonStub).restore();

				return {
					length: 4
				};
			});
			isolateScope.focussedRow = 0;
			isolateScope.jumpToRow(3);
			expect(isolateScope.focusRow).to.not.have.been.called;
		});

		it("should focus the first row if currently focussed row + offset is less than zero", (): void => {
			isolateScope.focussedRow = 0;
			isolateScope.jumpToRow(-10);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first() as JQuery<Element>;
			expect(isolateScope.focusRow).to.have.been.calledWith(matchTargetRow);
		});

		it("should focus the last row if the currently focussed row + offset is greater than the number of rows", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.jumpToRow(10);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last() as JQuery<Element>;
			expect(isolateScope.focusRow).to.have.been.calledWith(matchTargetRow);
		});

		it("should focus the currently focussed row + offset if within the bounds of the table", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.jumpToRow(-1);
			targetRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").first() as JQuery<Element>;
			expect(isolateScope.focusRow).to.have.been.calledWith(matchTargetRow);
		});
	});

	describe("clickHandler", (): void => {
		const event: JQueryMouseEventObjectMock = {};

		beforeEach((): SinonStub => sinon.stub(isolateScope, "focusRow"));

		it("should do nothing when navigation is disabled", (): void => {
			ogTableNavigableService.enabled = false;
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			expect(isolateScope.focusRow).to.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", (): void => {
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			expect(isolateScope.focusRow).to.not.have.been.called;
		});

		it("should focus the closest parent TR element to where the event occurred", (): void => {
			const cellInLastRow: Element = $window.$(ogTableNavigable["element"]).find("tbody > tr > td").last() as Element,
						lastRow: JQuery<Element> = $window.$(cellInLastRow).closest("[og-table-navigable] > tbody > tr") as JQuery<Element>;

			event.target = cellInLastRow;
			isolateScope.clickHandler(event as JQueryMouseEventObject);
			expect(isolateScope.focusRow).to.have.been.calledWith(lastRow);
		});
	});

	describe("doubleClickHandler", (): void => {
		const event: JQueryMouseEventObjectMock = {};

		it("should do nothing when navigation is disabled", (): void => {
			ogTableNavigableService.enabled = false;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			expect(scope.model.selectAction).to.not.have.been.called;
		});

		it("should do nothing if the event was triggered by a button click", (): void => {
			event.target = { localName: "button" } as Element;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			expect(scope.model.selectAction).to.not.have.been.called;
		});

		it("should do nothing if the closest parent TR element to where the event occurred could not be determined", (): void => {
			event.target = { localName: "td" } as Element;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			expect(scope.model.selectAction).to.not.have.been.called;
		});

		it("should invoke the selectAction handler for the closest parent TR element to where the event occurred", (): void => {
			event.target = $window.$(ogTableNavigable["element"]).find("tbody > tr > td").last() as Element;
			isolateScope.doubleClickHandler(event as JQueryMouseEventObject);
			expect(scope.model.selectAction).to.have.been.calledWith(1);
		});
	});

	describe("handlers.focusRow", (): void => {
		let lastRow: JQuery<Element>;
		const matchLastRow: SinonMatcher = sinon.match((value: JQuery<Element>): boolean => value[0] === lastRow[0]);

		beforeEach((): void => {
			sinon.stub(isolateScope, "focusRow");
			sinon.stub(isolateScope, "highlightRow");
			isolateScope.focussedRow = 0;
			lastRow = $window.$(ogTableNavigable["element"]).children("tbody").children("tr").last() as JQuery<Element>;
		});

		it("should do nothing if the target row could not be determined", (): void => {
			isolateScope.handlers.focusRow(3);
			expect(isolateScope.focusRow).to.not.have.been.called;
			expect(isolateScope.highlightRow).to.not.have.been.called;
		});

		it("should focus the target row if not already focussed", (): void => {
			isolateScope.handlers.focusRow(1);
			expect(isolateScope.focusRow).to.have.been.calledWith(matchLastRow);
			expect(isolateScope.highlightRow).to.not.have.been.called;
		});

		it("should highlight the target row if already focussed", (): void => {
			isolateScope.focussedRow = 1;
			isolateScope.handlers.focusRow(1);
			expect(isolateScope.focusRow).to.not.have.been.called;
			expect(isolateScope.highlightRow).to.have.been.calledWith(matchLastRow);
		});
	});

	describe("keyHandler", (): void => {
		const	TEST_MOVEMENT_KEYS: { code: number; name: string; amount: number; }[] = [
						{ code: 33, name: "page up", amount: -10 },
						{ code: 34, name: "page down", amount: 10 },
						{ code: 38, name: "arrow up", amount: -1 },
						{ code: 40, name: "arrow down", amount: 1 },
						{ code: 74, name: "J", amount: 1 },
						{ code: 75, name: "K", amount: -1 }
					],
					TEST_ACTION_KEYS: { code: number; ctrl?: boolean; name: string; handler: string; }[] = [
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
			expect(scope.model.selectAction).to.not.have.been.called;
		});

		TEST_MOVEMENT_KEYS.forEach((key: { code: number; name: string; amount: number; }): void => {
			it(`should jump ${key.amount < 0 ? "up" : "down"} ${Math.abs(key.amount)} row${1 === Math.abs(key.amount) ? "" : "s"} when the ${key.name} key is pressed`, (): void => {
				event.keyCode = key.code;
				isolateScope.keyHandler(event as JQueryKeyEventObject);
				expect(isolateScope.jumpToRow).to.have.been.calledWith(key.amount);
				expect(event.preventDefault as SinonStub).to.have.been.called;
			});
		});

		TEST_ACTION_KEYS.forEach((key: { code: number; ctrl?: boolean; name: string; handler: string; }): void => {
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
				expect(event.preventDefault as SinonStub).to.have.been.called;
			});

			it(`should invoke the defined ${key.handler} handler when the ${key.name} key${undefined === key.ctrl ? " is" : "s are"} pressed`, (): void => {
				event.keyCode = key.code;
				event.ctrlKey = key.ctrl;
				isolateScope.keyHandler(event as JQueryKeyEventObject);
				expect(scope.model[key.handler] as SinonStub).to.have.been.calledWith(1);
				expect(event.preventDefault as SinonStub).to.have.been.called;
			});
		});
	});

	it("should attach a click handler to the element", (): void => {
		sinon.stub(isolateScope, "clickHandler");
		ogTableNavigable["element"].triggerHandler("click");
		expect(isolateScope.clickHandler).to.have.been.called;
	});

	it("should attach a double-click handler to the element", (): void => {
		sinon.stub(isolateScope, "doubleClickHandler");
		ogTableNavigable["element"].triggerHandler("dblclick");
		expect(isolateScope.doubleClickHandler).to.have.been.called;
	});

	it("should attach a keydown handler to the document", (): void => {
		sinon.stub(isolateScope, "keyHandler");
		$window.$(document).triggerHandler("keydown");
		expect(isolateScope.keyHandler).to.have.been.called;
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
			expect(isolateScope.clickHandler).to.not.have.been.called;
		});

		it("should remove the double-click handler from the element", (): void => {
			ogTableNavigable["element"].triggerHandler("dblclick");
			expect(isolateScope.doubleClickHandler).to.not.have.been.called;
		});

		it("should remove the keydown handler from the element", (): void => {
			$window.$(document).triggerHandler("keydown");
			expect(isolateScope.keyHandler).to.not.have.been.called;
		});
	});
});
