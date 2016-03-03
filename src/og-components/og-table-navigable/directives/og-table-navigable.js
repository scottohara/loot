{
	/**
	 * Implementation
	 */
	class OgTableNavigableDirective {
		constructor(ogTableNavigableService) {
			return {
				restrict: "A",
				scope: {
					handlers: "=ogTableNavigable"
				},
				link: (scope, iElement) => {
					// Helper function to return all TR elements in the table body
					scope.getRows = () => $(iElement).children("tbody").children("tr");

					// Helper function to return the TR element for the specified index
					scope.getRowAtIndex = index => scope.getRows().eq(index);

					// Focus a row in the table
					scope.focusRow = row => {
						const rowIndex = angular.element(row).scope().$index;

						// Highlight the row
						scope.highlightRow(row);

						// Ensure the focussed row is in the current viewport
						scope.scrollToRow(row);

						// Store the focussed row index
						scope.focussedRow = rowIndex;

						// If a focus action is defined, invoke it for the focussed row
						if (scope.handlers.focusAction) {
							scope.handlers.focusAction(rowIndex);
						}
					};

					// Highlight the focussed row in the table
					scope.highlightRow = row => {
						const	focusClass = "warning";

						// Clear highlighting on any previously focussed row
						scope.getRows().removeClass(focusClass);

						// Highlight the focussed row
						row.addClass(focusClass);
					};

					// Checks if a row is off screen, and if so scrolls it into view
					scope.scrollToRow = row => {
						// Get the top/bottom of the focussed row, and the top/bottom of the viewport
						const	rowTop = row.offset().top,
									rowBottom = rowTop + row.height(),
									viewTop = $(document).scrollTop(),
									viewBottom = viewTop + $(window).height(),
									scrollDuration = 200;
						let scrollAmount;

						// Determine if the row is off screen
						if (rowTop < viewTop) {
							scrollAmount = rowTop - viewTop;
						} else if (rowBottom > viewBottom) {
							scrollAmount = rowBottom - viewBottom;
						}

						// If we have somewhere to scroll, do it now
						if (scrollAmount) {
							$("body").animate({
								scrollTop: `+=${scrollAmount}px`
							}, scrollDuration);
						}
					};

					// Helper function to make sure we're not outside the bounds of the table
					function checkTargetIndex(targetIndex, totalRows) {
						let checkedTargetIndex = targetIndex;

						if (checkedTargetIndex < 0) {
							checkedTargetIndex = 0;
						} else if (checkedTargetIndex >= totalRows) {
							checkedTargetIndex = totalRows - 1;
						}

						return checkedTargetIndex;
					}

					// Jump to X rows before or after the currently focussed row
					scope.jumpToRow = offset => {
						// If there is no current row focussed, do nothing
						if (null === scope.focussedRow) {
							return;
						}

						// Determine the row index to focus
						const	totalRows = scope.getRows().length,
									targetIndex = checkTargetIndex(scope.focussedRow + offset, totalRows),
									targetRow = scope.getRowAtIndex(targetIndex);

						if (targetRow.length > 0) {
							scope.focusRow(targetRow);
						}
					};

					// Helper function to determine the parent TR element (that is a direct descendent of the element for this directive)
					// where an event occurred
					function closestRow(target) {
						return $(target).closest("[og-table-navigable] > tbody > tr");
					}

					// Declare a click handler to focus a row by clicking it
					scope.clickHandler = event => {
						if (ogTableNavigableService.enabled) {
							// The event target could be any element in the table (including nested tables), so we need the closest row
							const clickedRow = closestRow(event.target);

							if (clickedRow.length > 0) {
								// Focus the clicked row
								scope.focusRow(clickedRow);
							}
						}
					};

					// Declare a double-click handler to perform an action on a row
					scope.doubleClickHandler = event => {
						if (ogTableNavigableService.enabled) {
							// If a select action wasn't specified for the directive, do nothing
							if (!scope.handlers.selectAction) {
								return;
							}

							// If the event target was a button, do nothing
							if ("button" === event.target.localName) {
								return;
							}

							// The event target could be any element in the table (including nested tables), so we need the closest row
							const clickedRow = closestRow(event.target);

							if (clickedRow.length > 0) {
								// Invoke the select action for the clicked row
								scope.handlers.selectAction(angular.element(clickedRow).scope().$index);
							}
						}
					};

					// Expose a function on the handlers object for external controllers to focus on a row
					scope.handlers.focusRow = index => {
						// Focus the target row (if not already focussed)
						const targetRow = scope.getRowAtIndex(index);

						if (targetRow.length > 0) {
							if (scope.focussedRow === index) {
								// Row is already focussed, just ensure it's highlighted
								scope.highlightRow(targetRow);
							} else {
								scope.focusRow(targetRow);
							}
						}
					};

					const	MOVEMENT_KEYS = {

									// Page up
									33: -10,

									// Page down
									34: 10,

									// Arrow up
									38: -1,

									// Arrow down
									40: 1,

									// J
									74: 1,

									// K
									75: -1
								},
								ACTION_KEYS = {

									// Backspace
									8: scope.handlers.deleteAction,

									// Enter
									13: scope.handlers.selectAction,

									// Esc
									27: scope.handlers.cancelAction,

									// Insert
									45: scope.handlers.insertAction,

									// Delete
									46: scope.handlers.deleteAction
								},
								CTRL_ACTION_KEYS = {

									// CTRL+E
									69: scope.handlers.editAction,

									// CTRL+N
									78: scope.handlers.insertAction
								};

					// Declare key handler to focus a row with the arrow keys
					scope.keyHandler = event => {
						if (ogTableNavigableService.enabled) {
							// Check if the key pressed was a movement key
							if (MOVEMENT_KEYS.hasOwnProperty(event.keyCode)) {
								// Jump the specified number of rows for the key
								scope.jumpToRow(MOVEMENT_KEYS[event.keyCode]);
								event.preventDefault();
							}

							// Check if the key pressed was an action key
							if (ACTION_KEYS.hasOwnProperty(event.keyCode)) {
								// If an action is defined, invoke it for the focussed row
								if (ACTION_KEYS[event.keyCode]) {
									ACTION_KEYS[event.keyCode](scope.focussedRow);
								}
								event.preventDefault();
							}

							// Check if the key pressed was a CTRL action key
							if (event.ctrlKey && CTRL_ACTION_KEYS.hasOwnProperty(event.keyCode)) {
								// If an action is defined, invoke it for the focussed row
								if (CTRL_ACTION_KEYS[event.keyCode]) {
									CTRL_ACTION_KEYS[event.keyCode](scope.focussedRow);
								}
								event.preventDefault();
							}
						}
					};

					// Attach the event handlers
					// (The handlers are wrapped in functions to aid with unit testing)
					function clickHandler(event) {
						scope.clickHandler(event);
					}

					function doubleClickHandler(event) {
						scope.doubleClickHandler(event);
					}

					function keyHandler(event) {
						scope.keyHandler(event);
					}

					iElement.on("click", clickHandler);
					iElement.on("dblclick", doubleClickHandler);
					$(document).on("keydown", keyHandler);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", () => {
						iElement.off("click", clickHandler);
						iElement.off("dblclick", doubleClickHandler);
						$(document).off("keydown", keyHandler);
					});
				}
			};
		}

		static factory(ogTableNavigableService) {
			return new OgTableNavigableDirective(ogTableNavigableService);
		}
	}

	/**
	 * Registration
	 */
	angular
		.module("ogComponents")
		.directive("ogTableNavigable", OgTableNavigableDirective.factory);

	/**
	 * Dependencies
	 */
	OgTableNavigableDirective.factory.$inject = ["ogTableNavigableService"];
}
