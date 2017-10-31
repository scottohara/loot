export default class OgNavigatorServiceWorkerService {
	constructor($window) {
		this.$window = $window;
	}

	register(serviceWorker) {
		if ("serviceWorker" in this.$window.navigator) {
			this.$window.navigator.serviceWorker.register(serviceWorker).then(registration => this.$window.console.log(`ServiceWorker registration successful with scope: ${registration.scope}`), error => this.$window.console.log(`ServiceWorker registration failed: ${error}`));
		}
	}
}

OgNavigatorServiceWorkerService.$inject = ["$window"];