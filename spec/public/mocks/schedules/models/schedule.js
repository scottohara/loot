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
			next_due_date: moment().startOf("day").add(3, "days").toDate(),
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
			{id: 1, next_due_date: moment().startOf("day").subtract(9, "days").toDate()},
			{id: 2, next_due_date: moment().startOf("day").subtract(8, "days").toDate()},
			{id: 3, next_due_date: moment().startOf("day").subtract(7, "days").toDate()},
			{id: 4, next_due_date: moment().startOf("day").subtract(6, "days").toDate()},
			{id: 5, next_due_date: moment().startOf("day").subtract(5, "days").toDate()},
			{id: 6, next_due_date: moment().startOf("day").subtract(4, "days").toDate()},
			{id: 7, next_due_date: moment().startOf("day").subtract(3, "days").toDate()},
			{id: 8, next_due_date: moment().startOf("day").subtract(2, "days").toDate()},
			{id: 9, next_due_date: moment().startOf("day").subtract(1, "day").toDate()}
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
	});
})();
