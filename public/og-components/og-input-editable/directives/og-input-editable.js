(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module('ogComponents');

	// Declare the ogInputEditable directive
	mod.directive('ogInputEditable', [
		function() {
			return {
				restrict: 'E',
				replace: true,
				scope: {
					type: '@',
					model: '=ngModel',
					source: '=',
					sourceParams: '=',
					itemSelected: '&typeaheadOnSelect'
				},
				templateUrl: function(element, attrs) {
					return 'og-components/og-input-editable/views/' + attrs.type + '.html';
				},
				link: function(scope, iElement) {
					var KEYCODES = {
						ENTER: 13,
						ESC: 27,
						UP: 38,
						DOWN: 40
					};

					var captureKeys;

					// Depending on the input type, declare key handlers to capture keystrokes that shouldn't bubble
					switch (scope.type) {
						case "date":
							captureKeys = function(event) {
								switch (event.keyCode) {
									case KEYCODES.UP:
									case KEYCODES.DOWN:
										event.stopPropagation();
										break;
								}
							};
							break;

						case "typeahead":
							scope.onSelect = function(item) {
								scope.itemSelected({item: item});
							};

							captureKeys = function(event) {
								switch (event.keyCode) {
									case KEYCODES.ENTER:
									case KEYCODES.ESC:
									case KEYCODES.UP:
									case KEYCODES.DOWN:
										// Only capture if the dropdown is visible
										if ($(this).children("ul.dropdown-menu:visible").length > 0) {
											event.stopPropagation();
										}
										break;
								}
							};
							break;
					}

					if (captureKeys) {
						// Attach the event handlers
						$(iElement).on('keydown', captureKeys);

						// When the element is destroyed, remove all event handlers
						iElement.on('$destroy', function() {
							$(iElement).off('keydown', captureKeys);
						});
					}
				}
			};
		}
	]);
})();
