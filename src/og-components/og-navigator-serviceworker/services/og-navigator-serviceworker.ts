export default class OgNavigatorServiceWorkerService {
	public constructor(private readonly $window: angular.IWindowService) {}

	public register(serviceWorker: string): void {
		if ("serviceWorker" in this.$window.navigator) {
			this.$window.navigator.serviceWorker.register(serviceWorker).then((registration: ServiceWorkerRegistration): void => this.$window.console.log(`ServiceWorker registration successful with scope: ${registration.scope}`), (error: string): void => this.$window.console.log(`ServiceWorker registration failed: ${error}`));
		}
	}
}

OgNavigatorServiceWorkerService.$inject = ["$window"];