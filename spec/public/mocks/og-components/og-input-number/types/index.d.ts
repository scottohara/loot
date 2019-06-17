import { SinonStub } from "sinon";

export interface OgInputNumberControllerType {
	type: "ogInputNumberController";
	formattedToRaw: SinonStub;
	rawToFormatted: SinonStub;
}

export type OgInputNumberControllerMock = () => OgInputNumberControllerType;