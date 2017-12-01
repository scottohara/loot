import {SinonStub} from "sinon";

export interface OgInputNumberControllerType {
	type: "ogInputNumberController";
	formattedToRaw: SinonStub;
	rawToFormatted: SinonStub;
}

export interface OgInputNumberControllerMock {
	(): OgInputNumberControllerType;
}