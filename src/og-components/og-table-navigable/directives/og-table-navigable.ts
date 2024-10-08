import type {
	OgTableActionCallback,
	OgTableMovementKeys,
	OgTableNavigableScope,
} from "~/og-components/og-table-navigable/types";
import type OgTableNavigableService from "~/og-components/og-table-navigable/services/og-table-navigable";
import angular from "angular";

export default class OgTableNavigableDirective {
	public constructor(
		$window: angular.IWindowService,
		ogTableNavigableService: OgTableNavigableService,
	) {
		const directive: angular.IDirective = {
			restrict: "A",
			scope: {
				handlers: "=ogTableNavigable",
			},
			link(scope: OgTableNavigableScope, iElement: JQuery<Element>): void {
				// Helper function to return all TR elements in the table body
				scope.getRows = (): JQuery<Element> =>
					$window
						.$(iElement)
						.children("tbody")
						.children("tr") as JQuery<Element>;

				// Helper function to return the TR element for the specified index
				scope.getRowAtIndex = (index: number): JQuery<Element> =>
					scope.getRows().eq(index);

				// Focus a row in the table
				scope.focusRow = (row: JQuery<Element>): void => {
					const rowIndex: number = angular
						.element(row)
						.scope<angular.IRepeatScope>().$index;

					// Highlight the row
					scope.highlightRow(row);

					// Ensure the focussed row is in the current viewport
					scope.scrollToRow(row);

					// Store the focussed row index
					scope.focussedRow = rowIndex;

					// Invoke the focus action for the focussed row
					scope.handlers.focusAction(rowIndex);
				};

				// Highlight the focussed row in the table
				scope.highlightRow = (row: JQuery<Element>): void => {
					const focusClass = "warning";

					// Clear highlighting on any previously focussed row
					scope.getRows().removeClass(focusClass);

					// Highlight the focussed row
					row.addClass(focusClass);
				};

				// Checks if a row is off screen, and if so scrolls it into view
				scope.scrollToRow = (row: JQuery<Element>): void => {
					// Get the top/bottom of the focussed row, and the top/bottom of the viewport
					const rowOffset: JQueryCoordinates | undefined = row.offset(),
						viewTop = Number($window.$(document).scrollTop()),
						rowTop: number = rowOffset?.top ?? viewTop,
						rowBottom: number = rowTop + Number(row.height()),
						viewBottom: number = viewTop + Number($window.$(window).height()),
						scrollNeeded: boolean = rowTop < viewTop || rowBottom > viewBottom;

					// If we have somewhere to scroll, do it now
					if (scrollNeeded) {
						row[0].scrollIntoView({ behavior: "smooth" });
					}
				};

				// Helper function to make sure we're not outside the bounds of the table
				function checkTargetIndex(
					targetIndex: number,
					totalRows: number,
				): number {
					let checkedTargetIndex: number = targetIndex;

					if (checkedTargetIndex < 0) {
						checkedTargetIndex = 0;
					} else if (checkedTargetIndex >= totalRows) {
						checkedTargetIndex = totalRows - 1;
					}

					return checkedTargetIndex;
				}

				// Jump to X rows before or after the currently focussed row
				scope.jumpToRow = (offset: number): void => {
					// If there is no current row focussed, do nothing
					if (null === scope.focussedRow) {
						return;
					}

					// Determine the row index to focus
					const totalRows: number = scope.getRows().length,
						targetIndex: number = checkTargetIndex(
							scope.focussedRow + offset,
							totalRows,
						),
						targetRow: JQuery<Element> = scope.getRowAtIndex(targetIndex);

					if (targetRow.length) {
						scope.focusRow(targetRow);
					}
				};

				// Helper function to determine the parent TR element (that is a direct descendent of the element for this directive) where an event occurred
				function closestRow(target: EventTarget): JQuery<Element> {
					return $window
						.$(target)
						.closest("[og-table-navigable] > tbody > tr") as JQuery<Element>;
				}

				// Declare a click handler to focus a row by clicking it
				scope.clickHandler = (event: JQuery.ClickEvent): void => {
					if (ogTableNavigableService.enabled) {
						// The event target could be any element in the table (including nested tables), so we need the closest row
						const clickedRow: JQuery<Element> = closestRow(
							event.target as EventTarget,
						);

						if (clickedRow.length) {
							// Focus the clicked row
							scope.focusRow(clickedRow);
						}
					}
				};

				// Declare a double-click handler to perform an action on a row
				scope.doubleClickHandler = (event: JQuery.DoubleClickEvent): void => {
					if (ogTableNavigableService.enabled) {
						// If the event target was a button, do nothing
						if ("button" === event.target.localName) {
							return;
						}

						// The event target could be any element in the table (including nested tables), so we need the closest row
						const clickedRow: JQuery<Element> = closestRow(
							event.target as EventTarget,
						);

						if (clickedRow.length) {
							// Invoke the select action for the clicked row
							scope.handlers.selectAction(
								angular.element(clickedRow).scope<angular.IRepeatScope>()
									.$index,
							);
						}
					}
				};

				// Expose a function on the handlers object for external controllers to focus on a row
				scope.handlers.focusRow = (index: number): void => {
					// Focus the target row (if not already focussed)
					const targetRow: JQuery<Element> = scope.getRowAtIndex(index);

					if (targetRow.length) {
						if (scope.focussedRow === index) {
							// Row is already focussed, just ensure it's highlighted
							scope.highlightRow(targetRow);
						} else {
							scope.focusRow(targetRow);
						}
					}
				};

				const MOVEMENT_KEYS: Record<string, OgTableMovementKeys> = {
						PageUp: -10,
						PageDown: 10,
						ArrowUp: -1,
						ArrowDown: 1,
						J: 1,
						j: 1,
						K: -1,
						k: -1,
					},
					ACTION_KEYS: Record<string, OgTableActionCallback | undefined> = {
						Backspace: scope.handlers.deleteAction,
						Enter: scope.handlers.selectAction,
						Escape: scope.handlers.cancelAction,
						Insert: scope.handlers.insertAction,
						Delete: scope.handlers.deleteAction,
					},
					CTRL_ACTION_KEYS: Record<string, OgTableActionCallback> = {
						E: scope.handlers.editAction,
						N: scope.handlers.insertAction,
					};

				// Declare key handler to focus a row with the arrow keys
				scope.keyHandler = (event: JQuery.KeyDownEvent): void => {
					if (ogTableNavigableService.enabled) {
						// Check if the key pressed was a movement key
						if (
							undefined !==
							Object.getOwnPropertyDescriptor(MOVEMENT_KEYS, event.key)
						) {
							// Jump the specified number of rows for the key
							scope.jumpToRow(MOVEMENT_KEYS[event.key]);
							event.preventDefault();
						}

						// Check if the key pressed was an action key
						if (
							undefined !==
							Object.getOwnPropertyDescriptor(ACTION_KEYS, event.key)
						) {
							const callback = ACTION_KEYS[event.key];

							// If an action is defined, invoke it for the focussed row
							callback?.(Number(scope.focussedRow));
							event.preventDefault();
						}

						// Check if the key pressed was a CTRL action key
						if (
							event.ctrlKey &&
							Object.getOwnPropertyDescriptor(
								CTRL_ACTION_KEYS,
								event.key.toUpperCase(),
							)
						) {
							// If an action is defined, invoke it for the focussed row
							if (
								undefined !==
								(CTRL_ACTION_KEYS[event.key.toUpperCase()] as
									| OgTableActionCallback
									| undefined)
							) {
								CTRL_ACTION_KEYS[event.key.toUpperCase()](
									Number(scope.focussedRow),
								);
							}
							event.preventDefault();
						}
					}
				};

				// Attach the event handlers (the handlers are wrapped in functions to aid with unit testing)
				function clickHandler(event: JQuery.ClickEvent): void {
					scope.clickHandler(event);
				}

				function doubleClickHandler(event: JQuery.DoubleClickEvent): void {
					scope.doubleClickHandler(event);
				}

				function keyHandler(event: JQuery.KeyDownEvent): void {
					scope.keyHandler(event);
				}

				iElement.on("click", clickHandler);
				iElement.on("dblclick", doubleClickHandler);
				$window.$(document).on("keydown", keyHandler);

				// When the element is destroyed, remove all event handlers
				iElement.on("$destroy", (): void => {
					iElement.off("click", clickHandler);
					iElement.off("dblclick", doubleClickHandler);
					$window.$(document).off("keydown", keyHandler);
				});
			},
		};

		return directive;
	}

	public static factory(
		$window: angular.IWindowService,
		ogTableNavigableService: OgTableNavigableService,
	): OgTableNavigableDirective {
		return new OgTableNavigableDirective($window, ogTableNavigableService);
	}
}

OgTableNavigableDirective.factory.$inject = [
	"$window",
	"ogTableNavigableService",
];
