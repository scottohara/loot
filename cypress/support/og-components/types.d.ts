export type Action = "del" | "edit" | "insert" | "select";

interface OgTableNavigableMouseAction {
	name: string;
	perform: (row: number) => void;
}

interface OgTableNavigableAction {
	heading: string;
	headingText: string;
	headingText2?: string;
	view: string;
	url?: RegExp;
	mouseAction?: OgTableNavigableMouseAction;
}

interface OgTableNavigableActions {
	insert: OgTableNavigableAction;
	edit: OgTableNavigableAction;
	del: OgTableNavigableAction;
	select: OgTableNavigableAction;
}

export interface OgTableNavigable {
	rows: string;
	actions: OgTableNavigableActions;
}
