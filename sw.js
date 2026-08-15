const CACHE_NAME = "adiyogitools-v4";

const urlsToCache = [
    "/",
    "/index.html",
    "/style.css"
];

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );

});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    // Google Analytics / Google Tag Manager ko Service Worker se bypass karo
    if (
        url.hostname.includes("google-analytics.com") ||
        url.hostname.includes("googletagmanager.com") ||
        url.hostname.includes("analytics.google.com")
    ) {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                // Sirf successful responses cache karo
                if (response && response.status === 200) {

                    const copy = response.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copy);
                    });

                }

                return response;

            })
            .catch(() => {

                return caches.match(event.request);

            })

    );

});
