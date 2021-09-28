export type CategoryDirection = "glyphicon-minus-sign" | "glyphicon-plus-sign";
export type CategoryDirectionLabel = "Expense" | "Income";

export interface Category {
	name: string;
	direction: CategoryDirection;
	parent?: string;
	favourite?: boolean;
}