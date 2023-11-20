export type OgTableActionCallback = (index?: number) => void;
export type OgTableMouseEventCallback = (event: JQueryMouseEventObject) => void;
export type OgTableKeyEventCallback = (event: JQueryKeyEventObject) => void;
export type OgTableRowAction = (row: JQuery<Element>) => void;
export type OgTableMovementKeys = -1 | -10 | 1 | 10;

export interface OgTableActions {
	[action: string]: OgTableActionCallback | null | undefined;
	selectAction: OgTableActionCallback;
	editAction: OgTableActionCallback;
	insertAction: OgTableActionCallback;
	deleteAction: OgTableActionCallback;
	cancelAction?: OgTableActionCallback;
	focusAction: OgTableActionCallback;
}

export type OgTableActionHandlers = OgTableActions & {
	focusRow: OgTableActionCallback;
};

export interface OgTableNavigableScope extends angular.IScope {
	focussedRow: number | null;
	handlers: OgTableActionHandlers;
	focusRow: OgTableRowAction;
	highlightRow: OgTableRowAction;
	scrollToRow: OgTableRowAction;
	clickHandler: OgTableMouseEventCallback;
	doubleClickHandler: OgTableMouseEventCallback;
	keyHandler: OgTableKeyEventCallback;
	getRows: () => JQuery<Element>;
	getRowAtIndex: (index: number) => JQuery<Element>;
	jumpToRow: (offset: number) => void;
}
