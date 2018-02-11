const APP_CACHE = 'capshare-v2';
const IMG_CACHE = 'capshare-images';
const urlsToCache = [
    '/favicon.ico',
    '/__/firebase/4.9.1/firebase-app.js',
    '/__/firebase/4.9.1/firebase-auth.js',
    '/__/firebase/4.9.1/firebase-database.js',
    '/__/firebase/4.9.1/firebase-storage.js',
    '/__/firebase/init.js',
    '/static/css/bootstrap.min.css',
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    '/static/js/jquery.min.js',
    '/static/js/bootstrap.min.js',
    '/static/js/idb-keyval.min.js',
    '/static/js/image-compressor.js'
];

// Install handler
self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(APP_CACHE).then(function (cache) {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch handler
self.addEventListener('fetch', function (event) {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.pathname.startsWith('/v0/b/capshareiml.appspot.com/o/images%2F')) {
        event.respondWith(
            caches.open(IMG_CACHE).then(function (cache) {
                return cache.match(event.request).then(function (resp) {
                    return resp || fetch(event.request).then(function (response) {
                        console.log(requestUrl);
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
            })
        );
    } else {
        event.respondWith(
            caches.open(APP_CACHE).then(function (cache) {
                return cache.match(event.request).then(function (resp) {
                    return resp || fetch(event.request);
                })
            })
        );
    }
});