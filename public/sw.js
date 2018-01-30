var CACHE_NAME = 'capshare-v1';
var urlsToCache = [
    '/',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    '/__/firebase/4.8.1/firebase-app.js',
    '/__/firebase/4.8.1/firebase-auth.js',
    '/__/firebase/4.8.1/firebase-database.js',
    '/__/firebase/4.8.1/firebase-messaging.js',
    '/__/firebase/4.8.1/firebase-storage.js',
    '/__/firebase/init.js',
    'https://code.jquery.com/jquery-3.2.1.slim.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
    'https://cdn.jsdelivr.net/npm/idb-keyval@2.3.0/idb-keyval.min.js'
];

// Install handler
self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch handler
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (resp) {
            console.log(resp);
            return resp || fetch(event.request).then(function (response) {
                return caches.open('capshare-v1').then(function (cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});