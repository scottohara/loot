import {
	CategoryDirection,
	CategoryDirectionLabel
} from "./types";
import { DIRECTION_INFLOW } from "categories";

export const categoryDeleteForm = "form[name=categoryForm]";
export const categoryDeleteHeading = `${categoryDeleteForm} > div.modal-header > h4`;
export const categoryToDeleteName = `${categoryDeleteForm} > div.modal-body > dl > dd:first`;
export const categoryToDeleteParent = `${categoryDeleteForm} > div.modal-body > dl > dd:nth-of-type(2)`;
export const categoryToDeleteDirection = `${categoryDeleteForm} > div.modal-body > dl > dd:last`;
export const cancelButton = `${categoryDeleteForm} button[type=button]`;
export const deleteButton = `${categoryDeleteForm} button[type=submit]`;
export const warningMessage = "All subcategories will also be deleted";
export const errorMessage = "";

export function getDirectionLabel(direction: CategoryDirection): CategoryDirectionLabel {
	if (DIRECTION_INFLOW === direction) {
		return "Income";
	}

	return "Expense";
}

