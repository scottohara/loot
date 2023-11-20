// Wildcard ambient module declaration for importing *.html files as strings
declare module "*.html" {
	const html: string;

	export default html;
}
