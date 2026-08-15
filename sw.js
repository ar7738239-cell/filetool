const CACHE_NAME = "adiyogitools-v3";

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

        }).then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        fetch(event.request)
            .then(response => {

                const copy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, copy);
                });

                return response;

            })
            .catch(() => {

                return caches.match(event.request);

            })

    );

});
