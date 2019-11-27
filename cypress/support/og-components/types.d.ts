export type Action = "insert" | "edit" | "del" | "select";

export interface OgTableNavigable {
	rows: string;
	actions: OgTableNavigableActions;
}

interface OgTableNavigableActions {
	insert: OgTableNavigableAction;
	edit: OgTableNavigableAction;
	del: OgTableNavigableAction;
	select: OgTableNavigableAction;
}

interface OgTableNavigableAction {
	heading: string;
	headingText: string;
	headingText2?: string;
	view: string;
	url?: RegExp;
	mouseAction?: OgTableNavigableMouseAction;
}

interface OgTableNavigableMouseAction {
	name: string;
	perform: (row: number) => void;
}