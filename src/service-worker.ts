// No-op service worker used for development
const worker = self as unknown as ServiceWorkerGlobalScope;

worker.addEventListener("install", (event: ExtendableEvent): void => {
	event.waitUntil(worker.skipWaiting());
});
self.addEventListener("activate", (event: ExtendableEvent): void =>
	event.waitUntil(worker.clients.claim()),
);

export default null;
