importScripts('/js/idb.js');
importScripts('/js/utility.js');


var CACHE_STATIC_NAME = 'static-v49';
var CACHE_DYNAMIC_NAME = 'dynamic-v23';
// var CACHE_MAP_NAME = 'map-v1';


var STATIC_FILES = [
    '/',
    'index.html',
    'restaurant.html',
    'd/i.js',
    'd/r.js',
    // 'js/app.js',
    // 'js/dbhelper.js',
    // 'js/idb.js',
    // 'js/main.js',
    // 'js/restaurant_info.js',
    // 'js/utility.js',
    'css/over550.css',
    'css/over850.css',
    'css/styles.css',
    '/data/restaurants.json'
    // 'offline.html'
];


self.addEventListener('install', function (event) {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function (cache) {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(STATIC_FILES);
            })
    )
});






self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service Worker ....', event);
    //we do cleanup here
    event.waitUntil(
        caches.keys()
            .then(function (KeyList) {
                return Promise.all(KeyList.map(function (key) {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME)
                    {
                        console.log('[Service Worker] Removing old Cache' , key);
                        return caches.delete(key);
                    }
                }));
            })
    );

    return self.clients.claim();
});


self.addEventListener('fetch', function(event) {

    /*Image cache here*/

    var requestUrl = new URL(event.request.url);

    if(requestUrl.pathname.startsWith('/dist/img/')){
        event.respondWith(servePhoto(event.request));
        return;
    }

    function servePhoto(request){

        return caches.open(CACHE_DYNAMIC_NAME).then(function(cache){
            return cache.match(request).then(function (response) {
                if(response){
                    return response;
                }
                return fetch(request).then(function(networkResponse){
                    cache.put(request.url, networkResponse.clone());
                    return networkResponse;
                })
            })
        })
    }

    /*above upto here*/

    /*Map cache here*/

    // var requestUrl = new URL(event.request.url);
    //
    // if(requestUrl.pathname.startsWith('/maps/')){
    //     event.respondWith(serveMap(event.request));
    //     return;
    // }
    //
    // function serveMap(request){
    //
    //     return caches.open(CACHE_MAP_NAME).then(function(cache){
    //         return cache.match(request).then(function (response) {
    //             if(response){
    //                 return response;
    //             }
    //             return fetch(request).then(function(networkResponse){
    //                 cache.put(request.url, networkResponse.clone());
    //                 return networkResponse;
    //             })
    //         })
    //     })
    // }
    /*Upto here*/

    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                if(response){
                    return response;
                }else{
                    return fetch(event.request)
                        .then(function (res) {
                            // return caches.open(CACHE_DYNAMIC_NAME)
                            //     .then(function (cache) {
                            //         cache.put(event.request.url,res.clone());
                                                                                    // var clonedRes = res.clone();
                                                                                    // clonedRes.json()
                                                                                    //     .then(function (data) {
                                                                                    //     for(var key in data){
                                                                                    //         writeData('stores' ,data[key]);
                                                                                    //     }
                                                                                    // });
                                    return res;
                                })
                        .catch(function (err) {
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function (cache) {
                                    return cache.match('offline.html');
                                });
                        });
                }
            })
    );
});