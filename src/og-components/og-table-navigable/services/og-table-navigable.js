export default class OgTableNavigableService {
	constructor() {
		// Enables/disables keyboard navigation on all navigable tables
		this.isEnabled = true;
	}

	get enabled() {
		return this.isEnabled;
	}

	set enabled(enabled) {
		this.isEnabled = enabled;
	}
}

OgTableNavigableService.$inject = [];