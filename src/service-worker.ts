// No-op service worker used for development
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", async (): Promise<void> => self.skipWaiting());
self.addEventListener("activate", (event: ExtendableEvent): void => event.waitUntil(self.clients.claim()));

export default null;