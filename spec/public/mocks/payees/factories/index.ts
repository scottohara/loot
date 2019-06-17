import { Payee } from "payees/types";

let id = 1;

export default function createPayee(props: Partial<Payee> = {}): Payee {
	id++;

	return {
		id,
		name: `Payee ${id}`,
		closing_balance: 0,
		favourite: false,
		num_transactions: 0,
		...props
	};
}