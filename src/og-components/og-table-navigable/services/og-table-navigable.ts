export default class OgTableNavigableService {
	// Enables/disables keyboard navigation on all navigable tables
	private isEnabled = true;

	public get enabled(): boolean {
		return this.isEnabled;
	}

	public set enabled(enabled: boolean) {
		this.isEnabled = enabled;
	}
}

OgTableNavigableService.$inject = [];