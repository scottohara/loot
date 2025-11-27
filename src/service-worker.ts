// No-op service worker used for development
const worker = self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener(
	"install",
	async (): Promise<void> => worker.skipWaiting(),
);
self.addEventListener("activate", (event: ExtendableEvent): void =>
	event.waitUntil(worker.clients.claim()),
);

export default null;
