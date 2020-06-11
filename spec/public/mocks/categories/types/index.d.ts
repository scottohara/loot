import { Category } from "categories/types";
import { SinonStub } from "sinon";

export interface CategoryModelMock {
	recent: string;
	type: string;
	all: SinonStub;
	allWithChildren: SinonStub;
	save: SinonStub;
	destroy: SinonStub;
	flush: SinonStub;
	addRecent: SinonStub;
	path: (id: number) => string;
	find: (id: number) => SinonStub;
	toggleFavourite: (category: Category) => SinonStub;
}