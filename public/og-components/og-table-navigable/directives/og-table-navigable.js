(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the ogTableNavigable directive
	mod.directive('ogTableNavigable', [
		function() {
			return {
				restrict: 'A',
				priority: 2,
				controller: function($scope, $element) {
					// Registered listeners
					$scope.listeners = {};

					// Add a listener
					this.addListener = function(type, callback) {
						if (!$scope.listeners.hasOwnProperty(type)) {
							$scope.listeners[type] = [callback];
						} else {
							$scope.listeners[type].push(callback);
						}
					};
					
					// Remove a listener
					this.removeListener = function(type, callback) {
						if ($scope.listeners.hasOwnProperty(type)) {
							var index = $scope.listeners[type].findIndex(function(listener) {
								return callback === listener;
							});

							if (index) {
								$scope.listeners[type].splice(index, 1);
							}
						}
					};

					// Returns all TR elements in the table
					$scope.getRows = function() {
						return $($element).children('tbody').children('tr');
					};

					// Returns the TR element the the specified index
					this.getRowAtIndex = function(index) {
						return $scope.getRows().eq(index);
					};
				},
				link: function(scope, iElement, iAttrs, ogTableNavigableController) {
					// Store a reference to the controller
					var controller = ogTableNavigableController;

					//Selects a row in the table 
					var selectRow = function(row) {
						var	highlightClass = "warning",
								selectedIndex = angular.element(row).scope().$index;

						// If the row is already selected, do nothing
						if (controller.currentRow === selectedIndex) {
							return false;
						}

						// Notify any listeners that current row is about to change
						notifyListeners('rowWillChange');

						// Clear existing selected row highlighting on any previously selected row
						scope.getRows().removeClass(highlightClass);

						// Highlight the selected row
						row.addClass(highlightClass);
						
						// Ensure the row is in the current viewport
						scrollToRow(row);

						// Store the selected row index
						controller.currentRow = angular.element(row).scope().$index;

						// True indicates that the row was selected
						return true;
					};

					// Checks if a row is off screen, and if so scrolls it into view
					var scrollToRow = function(row) {

						// Get the top/bottom of the selected row, and the top/bottom of the viewport
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

					// Selects the row X before the currently selected row
					var selectPreviousRow = function(num) {
						// If there is no current row selected, or we're already at the first row, do nothing
						if (controller.currentRow < 1) {
							return;
						}

						// Determine the row to select
						var targetRow = controller.currentRow - num;
						if (targetRow < 0) {
							targetRow = 0;
						}

						// Select the target row
						var previousRow = controller.getRowAtIndex(targetRow);
						if (previousRow.length > 0) {
							// Select the row
							selectRow(previousRow);
						}
					};

					// Selects the row X after the currently selected row
					var selectNextRow = function(num) {
						// If there is no current row selected, do nothing
						if (controller.currentRow === null) {
							return;
						}
						
						// Determine the row to select
						var targetRow = controller.currentRow + num,
								totalRows = scope.getRows().length;

						if (targetRow >= totalRows) {
							targetRow = totalRows - 1;
						}

						// Get the row immediately following the currently selected row
						var nextRow = controller.getRowAtIndex(targetRow);
						if (nextRow.length > 0) {
							// Select the row
							selectRow(nextRow);
						}
					};

					// Notify listeners
					var notifyListeners = function(type, args) {
						if (scope.listeners.hasOwnProperty(type)) {
							scope.listeners[type].forEach(function(callback) {
								callback(args);
							});
						}
					};

					// Declare a click handler to select a row by clicking it
					var clickHandler = function(event) {
						// The event target could be any element in the table (including nested tables)
						// We need to locate the parent TR element that is a direct descendent of the element for this directive
						var clickedRow = $(event.target).closest('[og-table-navigable] > tbody > tr');
						if (clickedRow.length > 0) {
							// Select the row and notify any listeners whether the row was already selected or not
							notifyListeners('rowClicked', selectRow(clickedRow));
						}
					};

					var KEYCODES = {
						PAGEUP: 33,
						PAGEDOWN: 34,
						UP: 38,
						DOWN: 40
					};

					// Declare key up/down handlers to select a row with the arrow keys
					var keyUpDown = function(event) {
						switch (event.keyCode) {
							case KEYCODES.PAGEUP:
								selectPreviousRow(10);
								event.preventDefault();
								break;

							case KEYCODES.PAGEDOWN:
								selectNextRow(10);
								event.preventDefault();
								break;

							case KEYCODES.UP:
								selectPreviousRow(1);
								event.preventDefault();
								break;

							case KEYCODES.DOWN:
								selectNextRow(1);
								event.preventDefault();
								break;
						}
					};

					// Attach the event handlers
					iElement.on('click', clickHandler);
					$(document).on('keydown', keyUpDown);

					// When the element is destroyed, remove all event handlers
					iElement.on('$destroy', function() {
						iElement.off('click', clickHandler);
						$(document).off('keydown', keyUpDown);
					});
				}
			};
		}
	]);
})();
