// Components
import ScheduleMockProvider from "~/mocks/schedules/providers/schedule";
import ScheduleModelMockProvider from "~/mocks/schedules/models/schedule";
import SchedulesMockProvider from "~/mocks/schedules/providers/schedules";
import angular from "angular";

angular
	.module("lootSchedulesMocks", [])
	.provider("scheduleMock", ScheduleMockProvider)
	.provider("schedulesMock", SchedulesMockProvider)
	.provider("scheduleModelMock", ScheduleModelMockProvider);
