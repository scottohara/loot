(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the ogTableEditable directive
	mod.directive('ogTableEditable', [
		function() {
			return {
				restrict: 'A',
				require: 'ogTableNavigable',
				scope: {
					commitHandler: '&ogTableEditable'
				},
				link: function(scope, iElement, iAttrs, ogTableNavigableController) {
					// Store a reference to the controller
					var controller = ogTableNavigableController;

					// Returns the list of ogInputEditable directives for a given row
					var getEditableInputs = function(row) {
						return row.find('[og-input-editable]');
					};

					// Enters edit mode
					var enterEditMode = function() {
						var currentRow = controller.getRowAtIndex(controller.currentRow);

						// Snapshot of original values
						scope.originalValues = [];

						// Iterate over the list of child ogInputEditable directives
						getEditableInputs(currentRow).each(function(index, input) {
							// Snapshot the current value
							scope.originalValues.push(angular.element(input).controller('ngModel').$modelValue);

							// Switch the directive to edit mode
							scope.$apply(angular.element(input).isolateScope().editing = true);
						});
						
						scope.editMode = true;
					};

					// Commits the changes and drops out of edit mode
					var commitChanges = function() {
						// Call the commit handler to save the data for the current row
						var committed = scope.commitHandler({
							index: controller.currentRow
						});

						if (committed) {
							// Exit out of edit mode
							exitEditMode();
						}
					};

					// Rolls back the changes and drops out of edit mode
					var rollbackChanges = function() {
						// Iterate over the list of child ogInputEditable directives and restore their original values
						getEditableInputs(controller.getRowAtIndex(controller.currentRow)).each(function(index, input) {
							scope.$apply(angular.element(input).controller('ngModel').$setViewValue(scope.originalValues[index]));
						});

						// Exit out of edit mode
						exitEditMode();
					};

					// Exits edit mode
					var exitEditMode = function() {
						// Discard the row snapshot
						scope.originalValues = null;

						// Iterate over the list of child ogInputEditable directives
						getEditableInputs(controller.getRowAtIndex(controller.currentRow)).each(function(index, input) {
							// Switch the directive to view mode
							scope.$apply(angular.element(input).isolateScope().editing = false);
						});

						// Exit out of edit mode
						scope.editMode = false;
					};

					// Register with the ogTableNavigable directive to be notified whenever the current row will change
					controller.addListener('rowWillChange', function() {
						// If we're in edit mode, rollback any pending changes
						if (scope.editMode) {
							rollbackChanges();
						}
					});

					// Register with the og-table-navigable directive to be notified whenever a row is clicked
					controller.addListener('rowClicked', function(rowChanged) {
						// If the clicked row was already selected and we're not in edit mode, enter edit mode
						if (!rowChanged && !scope.editMode) {
							enterEditMode();
						}
					});

					var KEYCODES = {
						ENTER: 13,
						ESC: 27
					};

					// Declare key enter/escape handlers to enter or exit edit mode
					var keyEnterEsc = function(event) {
						switch (event.keyCode) {
							case KEYCODES.ENTER:
								// If we're in edit mode, commit changes; otherwise enter edit mode
								if (scope.editMode) {
									commitChanges();
								} else {
									enterEditMode();
								}
								event.preventDefault();
								break;

							case KEYCODES.ESC:
								// If we're in edit mode, rollback changes
								if (scope.editMode) {
									rollbackChanges();
								}
								event.preventDefault();
								break;
						}
					};

					// Attach the event handlers
					$(document).on('keydown', keyEnterEsc);

					// When the element is destroyed, remove all event handlers
					iElement.on('$destroy', function() {
						$(document).off('keydown', keyEnterEsc);
					});
				}
			};
		}
	]);
})();
