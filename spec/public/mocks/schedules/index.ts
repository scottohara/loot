// Components
import ScheduleMockProvider from "./providers/schedule";
import ScheduleModelMockProvider from "./models/schedule";
import SchedulesMockProvider from "./providers/schedules";
import angular from "angular";

angular.module("lootSchedulesMocks", [])
	.provider("scheduleMock", ScheduleMockProvider)
	.provider("schedulesMock", SchedulesMockProvider)
	.provider("scheduleModelMock", ScheduleModelMockProvider);