(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogComponents");

	// Declare the ogTableNavigable directive
	mod.directive("ogTableNavigable", [
		function() {
			return {
				restrict: "A",
				scope: {
					handlers: "=ogTableNavigable"
				},
				link: function(scope, iElement) {
					// Helper function to return all TR elements in the table body
					scope.getRows = function() {
						return $(iElement).children("tbody").children("tr");
					};

					// Helper function to return the TR element for the specified index
					scope.getRowAtIndex = function(index) {
						return scope.getRows().eq(index);
					};

					// Focus a row in the table 
					scope.focusRow = function(row) {
						var rowIndex = angular.element(row).scope().$index;

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
					scope.highlightRow = function(row) {
						var	focusClass = "warning";
						
						// Clear highlighting on any previously focussed row
						scope.getRows().removeClass(focusClass);

						// Highlight the focussed row
						row.addClass(focusClass);
					};

					// Checks if a row is off screen, and if so scrolls it into view
					scope.scrollToRow = function(row) {
						// Get the top/bottom of the focussed row, and the top/bottom of the viewport
						var	rowTop = row.offset().top,
								rowBottom = rowTop + row.height(),
								viewTop = $(document).scrollTop(),
								viewBottom = viewTop + $(window).height(),
								scrollAmount;

						// Determine if the row is off screen
						if (rowTop < viewTop) {
							scrollAmount = rowTop - viewTop;
						} else if (rowBottom > viewBottom) {
							scrollAmount = rowBottom - viewBottom;
						}

						// If we have somewhere to scroll, do it now
						if (scrollAmount) {
							$("body").animate({
								scrollTop: "+=" + scrollAmount + "px"
							}, 200);
						}
					};

					// Jump to X rows before or after the currently focussed row
					scope.jumpToRow = function(offset) {
						// If there is no current row focussed, do nothing
						if (scope.focussedRow === null) {
							return;
						}

						// Determine the row index to focus
						var targetIndex = scope.focussedRow + offset,
								totalRows = scope.getRows().length;

						// Make sure we're not outside the bounds of the table
						if (targetIndex < 0) {
							targetIndex = 0;
						} else if (targetIndex >= totalRows) {
							targetIndex = totalRows - 1;
						}

						// Focus the target row
						var targetRow = scope.getRowAtIndex(targetIndex);
						if (targetRow.length > 0) {
							scope.focusRow(targetRow);
						}
					};

					// Helper function to determine the parent TR element (that is a direct descendent of the element for this directive)
					// where an event occurred
					var closestRow = function(target) {
						return $(target).closest("[og-table-navigable] > tbody > tr");
					};

					// Declare a click handler to focus a row by clicking it
					scope.clickHandler = function(event) {
						if (scope.handlers.navigationEnabled()) {
							// The event target could be any element in the table (including nested tables), so we need the closest row
							var clickedRow = closestRow(event.target);
							if (clickedRow.length > 0) {
								// Focus the clicked row
								scope.focusRow(clickedRow);
							}
						}
					};

					// Declare a double-click handler to perform an action on a row
					scope.doubleClickHandler = function(event) {
						if (scope.handlers.navigationEnabled()) {
							// If a select action wasn't specified for the directive, do nothing
							if (!scope.handlers.selectAction) {
								return;
							}

							// If the event target was a button, do nothing
							if ("button" === event.target.localName) {
								return;
							}

							// The event target could be any element in the table (including nested tables), so we need the closest row
							var clickedRow = closestRow(event.target);
							if (clickedRow.length > 0) {
								// Invoke the select action for the clicked row
								scope.handlers.selectAction(angular.element(clickedRow).scope().$index);
							}
						}
					};

					// Expose a function on the handlers object for external controllers to focus on a row
					scope.handlers.focusRow = function(index) {
						// Focus the target row (if not already focussed)
						var targetRow = scope.getRowAtIndex(index);
						if (targetRow.length > 0) {
							if (scope.focussedRow !== index) {
								scope.focusRow(targetRow);
							} else {
								// Row is already focussed, just ensure it's highlighted
								scope.highlightRow(targetRow);
							}
						}
					};

					var MOVEMENT_KEYS = {
						33: -10,	// Page up 
						34: 10,		// Page down
						38: -1,		// Arrow up
						40: 1,		// Arrow down
						74: 1,		// J
						75: -1		// K
					};

					var ACTION_KEYS = {
						8: scope.handlers.deleteAction,		// Backspace
						13: scope.handlers.selectAction,	// Enter
						27: scope.handlers.cancelAction,	// Esc
						45: scope.handlers.insertAction,	// Insert
						46: scope.handlers.deleteAction		// Delete
					};

					var CTRL_ACTION_KEYS = {
						69: scope.handlers.editAction,		// CTRL+E
						78: scope.handlers.insertAction		// CTRL+N
					};

					// Declare key handler to focus a row with the arrow keys
					scope.keyHandler = function(event) {
						if (scope.handlers.navigationEnabled()) {
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
					var clickHandler = function(event) {
						scope.clickHandler(event);
					};

					var doubleClickHandler = function(event) {
						scope.doubleClickHandler(event);
					};

					var keyHandler = function(event) {
						scope.keyHandler(event);
					};

					iElement.on("click", clickHandler);
					iElement.on("dblclick", doubleClickHandler);
					$(document).on("keydown", keyHandler);

					// When the element is destroyed, remove all event handlers
					iElement.on("$destroy", function() {
						iElement.off("click", clickHandler);
						iElement.off("dblclick", doubleClickHandler);
						$(document).off("keydown", keyHandler);
					});
				}
			};
		}
	]);
})();
