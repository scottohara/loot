import {
	Category,
	CategoryDirection
} from "categories/types";

const subcategory = ":has(> td.subcategory)",
			categoryDirection = "td.direction > i",
			categoryName = "td.has-action",
			parentCategory = ":not(:has(> td.subcategory)):first";

export const categoriesTableRows = "#categories > tbody > tr";
export const favouriteButton = "i[og-favourite]";
export const editButton = "i.glyphicon-edit";
export const firstParentCategory = `${categoriesTableRows}:not(${subcategory}):first`;
export const lastParentCategory = `${categoriesTableRows}:not(${subcategory}):last`;
export const firstSubcategory = `${categoriesTableRows}${subcategory}:first`;
export const secondSubcategory = `${categoriesTableRows}${subcategory}:nth-of-type(3)`;
export const lastSubcategory = `${categoriesTableRows}${subcategory}:last`;
export const secondLastSubcategory = `${categoriesTableRows}${subcategory}:nth-last-of-type(2)`;
export const firstCategory = `${categoriesTableRows}:first`;
export const lastCategory = `${categoriesTableRows}:last`;

export const DIRECTION_INFLOW = "glyphicon-plus-sign";
export const DIRECTION_OUTFLOW = "glyphicon-minus-sign";

function getDirectionClass(direction: JQuery<HTMLTableRowElement>): CategoryDirection {
	if (direction.hasClass(DIRECTION_INFLOW)) {
		return DIRECTION_INFLOW;
	}

	return DIRECTION_OUTFLOW;
}

export function getValuesFrom(row: JQuery<HTMLTableRowElement>): Category {
	let parent: string | undefined;

	if (row.find(categoryName).hasClass("subcategory")) {
		parent = row.prevAll(parentCategory).find(categoryName).text().trim();
	}

	return {
		direction: getDirectionClass(row.find(categoryDirection)),
		name: row.find(categoryName).text().trim(),
		parent,
		favourite: row.find(favouriteButton).hasClass("active")
	};
}

export function checkRowMatches(expectedValues: Category): void {
	cy.get(categoryDirection).should("have.class", expectedValues.direction);
	cy.get(categoryName).should("contain.text", expectedValues.name);
	cy.get(categoryName).should(`${undefined === expectedValues.parent ? "not." : ""}have.class`, "subcategory");
	cy.get(favouriteButton).should(`${true === expectedValues.favourite ? "" : "not."}have.class`, "active");
	cy.get(editButton).should("exist");
}