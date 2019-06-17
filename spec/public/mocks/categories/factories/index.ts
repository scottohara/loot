import { Category } from "categories/types";

let id = 1;

export default function createCategory(props: Partial<Category> = {}): Category {
	id++;

	return {
		id,
		name: `Category ${id}`,
		closing_balance: 0,
		direction: "inflow" as "inflow",
		parent_id: null,
		favourite: false,
		num_children: 0,
		num_transactions: 0,
		...props
	};
}