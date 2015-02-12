(function() {
	"use strict";

	/**
	 * Registration
	 */
	angular
		.module("lootSchedulesMocks")
		.provider("scheduleModelMock", Provider);

	/**
	 * Dependencies
	 */
	Provider.$inject = ["scheduleMockProvider", "schedulesMockProvider", "$qMockProvider"];

	/**
	 * Implementation
	 */
	function Provider(scheduleMockProvider, schedulesMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: scheduleMockProvider.$get()
		};
		
		error = {
			args: {id: -1}
		};

		// Mock scheduleModel object
		provider.scheduleModel = {
			all: sinon.stub().returns(schedulesMockProvider.$get()),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error)
		};

		provider.$get = function() {
			// Return the mock scheduleModel object
			return provider.scheduleModel;
		};
	}
})();
