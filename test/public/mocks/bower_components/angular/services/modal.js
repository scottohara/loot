(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("ogAngularMocks");

	// Declare the $modalMock provider
	mod.provider("$modalMock", function() {
		var provider = this;

		// Mock $modal object
		provider.$modal = {
			open: function(options) {
				// If there are any resolves, resolve them
				if (options.resolve) {
					provider.$modal.resolves = Object.keys(options.resolve).reduce(function(resolves, resolve) {
						resolves[resolve] = options.resolve[resolve]();
						return resolves;
					}, {});
				}

				// Return a result object that is promise-like, but instead of invoking the callbacks it just stores them
				// for later use by close() and dismiss()
				return {
					result: {
						then: function(callback) {
							// Store the callback
							provider.$modal.closeCallback = callback;

							// Return an object that is promise-like
							return {
								finally: function(callback) {
									provider.$modal.finallyCallback = callback;
								}
							};
						},
						catch: sinon.stub()
					}
				};
			},
			close: function(value) {
				provider.$modal.closeCallback(value);
				if (provider.$modal.finallyCallback) {
					provider.$modal.finallyCallback();
				}
			},
			dismiss: function() {
				if (provider.$modal.finallyCallback) {
					provider.$modal.finallyCallback();
				}
			}
		};

		// Spy on open()
		sinon.spy(provider.$modal, "open");

		provider.$get = function() {
			return provider.$modal;
		};
	});
})();
