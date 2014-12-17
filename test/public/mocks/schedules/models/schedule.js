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
			next_due_date: moment().add(3, "days").format("YYYY-MM-DD"),
			subtransactions: [{}],
			autoFlag: false,
			flag: null
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
			{id: 1, next_due_date: moment().subtract(9, "days").format("YYYY-MM-DD")},
			{id: 2, next_due_date: moment().subtract(8, "days").format("YYYY-MM-DD")},
			{id: 3, next_due_date: moment().subtract(7, "days").format("YYYY-MM-DD")},
			{id: 4, next_due_date: moment().subtract(6, "days").format("YYYY-MM-DD")},
			{id: 5, next_due_date: moment().subtract(5, "days").format("YYYY-MM-DD")},
			{id: 6, next_due_date: moment().subtract(4, "days").format("YYYY-MM-DD")},
			{id: 7, next_due_date: moment().subtract(3, "days").format("YYYY-MM-DD")},
			{id: 8, next_due_date: moment().subtract(2, "days").format("YYYY-MM-DD")},
			{id: 9, next_due_date: moment().subtract(1, "day").format("YYYY-MM-DD"), }
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
