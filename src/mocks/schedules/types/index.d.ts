import type { SinonStub } from "sinon";

export interface ScheduleModelMock {
	all: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
}