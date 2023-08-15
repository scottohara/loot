import type { Entity } from "~/loot/types";

export interface Security extends Entity {
	code: string;
	current_holding: number;
	favourite: boolean;
	unused: boolean;
	num_transactions: number;
}