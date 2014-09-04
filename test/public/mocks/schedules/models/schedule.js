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

	// Declare the schedulesMock provider
	mod.provider("schedulesMock", function() {
		var provider = this;

		// Mock schedules object
		provider.schedules = [
			{id: 1, transaction_date: moment().subtract("days", 9).format("YYYY-MM-DD")},
			{id: 2, transaction_date: moment().subtract("days", 8).format("YYYY-MM-DD")},
			{id: 3, transaction_date: moment().subtract("days", 7).format("YYYY-MM-DD")},
			{id: 4, transaction_date: moment().subtract("days", 6).format("YYYY-MM-DD")},
			{id: 5, transaction_date: moment().subtract("days", 5).format("YYYY-MM-DD")},
			{id: 6, transaction_date: moment().subtract("days", 4).format("YYYY-MM-DD")},
			{id: 7, transaction_date: moment().subtract("days", 3).format("YYYY-MM-DD")},
			{id: 8, transaction_date: moment().subtract("days", 2).format("YYYY-MM-DD")},
			{id: 9, transaction_date: moment().subtract("days", 1).format("YYYY-MM-DD")}
		];

		provider.$get = function() {
			// Return the mock schedules object
			return provider.schedules;
		};
	});

	// Declare the scheduleModelMock provider
	mod.provider("scheduleModelMock", function(scheduleMockProvider, schedulesMockProvider, $qMockProvider) {
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
			all: sinon.stub().returns(schedulesMockProvider.$get()),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error)
		};

		provider.$get = function() {
			// Return the mock scheduleModel object
			return provider.scheduleModel;
		};
	});
})();
