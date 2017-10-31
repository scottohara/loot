export default class ScheduleModelMockProvider {
	constructor(scheduleMockProvider, schedulesMockProvider, $qMockProvider) {
		// Success/error = options for the stub promises
		const	success = {
						args: {id: 1},
						response: scheduleMockProvider.$get()
					},
					error = {
						args: {id: -1}
					},
					$q = $qMockProvider.$get();

		// Mock scheduleModel object
		this.scheduleModel = {
			all: sinon.stub().returns(schedulesMockProvider.$get()),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error)
		};
	}

	$get() {
		// Return the mock scheduleModel object
		return this.scheduleModel;
	}
}

ScheduleModelMockProvider.$inject = ["scheduleMockProvider", "schedulesMockProvider", "$qMockProvider"];