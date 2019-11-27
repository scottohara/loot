export type CategoryDirection = "glyphicon-plus-sign" | "glyphicon-minus-sign";
export type CategoryDirectionLabel = "Income" | "Expense";

export interface Category {
	name: string;
	direction: CategoryDirection;
	parent?: string;
	favourite?: boolean;
}