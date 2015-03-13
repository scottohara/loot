(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("ogAngularMocks")
		.provider("$modalMock", Provider);

	/**
	 * Implementation
	 */
	function Provider() {
		var provider = this,
				callbackResult;

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
							return this;
						},
						catch: function(callback) {
							provider.$modal.catchCallback = callback;
							return this;
						},
						finally: function(callback) {
							provider.$modal.finallyCallback = callback;
							return this;
						}
					}
				};
			},
			close: function(value) {
				callbackResult = provider.$modal.closeCallback(value);
				if (provider.$modal.finallyCallback) {
					callbackResult = provider.$modal.finallyCallback(callbackResult);
				}

				return callbackResult;
			},
			dismiss: function() {
				if (provider.$modal.catchCallback) {
					callbackResult = provider.$modal.catchCallback();
				}

				if (provider.$modal.finallyCallback) {
					callbackResult = provider.$modal.finallyCallback(callbackResult);
				}

				return callbackResult;
			}
		};

		// Spy on open()
		sinon.spy(provider.$modal, "open");

		provider.$get = function() {
			return provider.$modal;
		};
	}
})();
