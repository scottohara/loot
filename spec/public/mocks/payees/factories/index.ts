import {Payee} from "payees/types";

let id: number = 1;

export default function createPayee(props: Partial<Payee> = {}): Payee {
	id++;

	return Object.assign({
		id,
		name: `Payee ${id}`,
		closing_balance: 0,
		favourite: false,
		num_transactions: 0
	}, props);
}