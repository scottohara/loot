import {Security} from "securities/types";

let id: number = 1;

export default function createSecurity(props: Partial<Security> = {}): Security {
	id++;

	return Object.assign({
		id,
		name: `Security ${id}`,
		closing_balance: 0,
		code: `A${id}`,
		current_holding: 0,
		favourite: false,
		unused: false,
		num_transactions: 0
	}, props);
}