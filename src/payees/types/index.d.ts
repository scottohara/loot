import type { Entity } from "~/loot/types";

export interface Payee extends Entity {
	favourite: boolean;
	num_transactions: number;
}
