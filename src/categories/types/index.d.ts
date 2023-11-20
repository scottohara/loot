import type { Entity } from "~/loot/types";

export interface Category extends Entity {
	direction: "inflow" | "outflow";
	parent_id: number | null;
	parent?: Category | null;
	children?: Category[];
	favourite: boolean;
	num_children?: number;
	num_transactions: number;
}

interface PsuedoCategory {
	id: string;
	name: string;
}

export type DisplayCategory = Category | PsuedoCategory;
