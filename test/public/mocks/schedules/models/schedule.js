(function() {
	"use strict";

	// Reopen the module
	var mod = angular.module("schedulesMocks");

	// Declare the scheduleMock provider
	mod.provider("scheduleMock", function() {
		var provider = this;

		// Mock schedule object
		provider.schedule = {
			id: 1,
			transaction_type: "Transfer",
			next_due_date: moment().add("days", 3).format("YYYY-MM-DD"),
			subtransactions: [{}]
		};

		provider.$get = function() {
			// Return the mock schedule object
			return provider.schedule;
		};
	});

	// Declare the scheduleModelMock provider
	mod.provider("scheduleModelMock", function(scheduleMockProvider, $qMockProvider) {
		var provider = this,
				success,
				error,
				$q = $qMockProvider.$get();

		// Options for the stub promises
		success = {
			args: {id: 1},
			response: {data: scheduleMockProvider.$get()}
		};
		
		error = {
			args: {id: -1}
		};

		// Mock scheduleModel object
		provider.scheduleModel = {
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error)
		};

		provider.$get = function() {
			// Return the mock scheduleModel object
			return provider.scheduleModel;
		};
	});
})();
