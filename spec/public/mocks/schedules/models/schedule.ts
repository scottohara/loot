import {
	PromiseMockConfig,
	QMock
} from "mocks/node-modules/angular/types";
import {Mock} from "mocks/types";
import QMockProvider from "mocks/node-modules/angular/services/q";
import ScheduleMockProvider from "mocks/schedules/providers/schedule";
import {ScheduleModelMock} from "mocks/schedules/types";
import {ScheduledTransferTransaction} from "schedules/types";
import SchedulesMockProvider from "mocks/schedules/providers/schedules";
import sinon from "sinon";

export default class ScheduleModelMockProvider implements Mock<ScheduleModelMock> {
	private readonly scheduleModel: ScheduleModelMock;

	public constructor(scheduleMockProvider: ScheduleMockProvider, schedulesMockProvider: SchedulesMockProvider, $qMockProvider: QMockProvider) {
		// Success/error = options for the stub promises
		const	success: PromiseMockConfig<ScheduledTransferTransaction> = {
						args: {id: 1},
						response: scheduleMockProvider.$get()
					},
					error: PromiseMockConfig<void> = {
						args: {id: -1}
					},
					$q: QMock = $qMockProvider.$get();

		// Mock scheduleModel object
		this.scheduleModel = {
			all: sinon.stub().returns(schedulesMockProvider.$get()),
			save: $q.promisify(success, error),
			destroy: $q.promisify(success, error)
		};
	}

	public $get(): ScheduleModelMock {
		// Return the mock scheduleModel object
		return this.scheduleModel;
	}
}

ScheduleModelMockProvider.$inject = ["scheduleMockProvider", "schedulesMockProvider", "$qMockProvider"];