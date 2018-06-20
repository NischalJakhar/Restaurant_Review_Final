/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to http://localhost:${port}/data/restaurants.json  on your server (http://localhost:1337/restaurants)
   */
  static get DATABASE_URL() {
    const port = 1337;  // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }



   /**
   * Fetch all restaurants.
   */
  // static fetchRestaurants(callback) {
  //       let xhr = new XMLHttpRequest();
  //       xhr.open('GET', DBHelper.DATABASE_URL);
  //       xhr.onload = () => {
  //           if (xhr.status === 200) { // Got a success response from server!
  //               console.log("Ho gaya connect....");
  //               // console.log(xhr.responseText);
  //               const json = JSON.parse(xhr.responseText);
  //               console.log(json);
  //               // const restaurants = json.restaurants;
  //               const restaurants = json;
  //               // console.log(json.restaurants[0]);
  //
  //               callback(null, restaurants);
  //           } else { // Oops!. Got an error from server.
  //               const error = (`Request failed. Returned status of ${xhr.status}`);
  //               callback(error, null);
  //           }
  //       };
  //       xhr.send();
  //   }


   static fetchRestaurants(callback) {
       return readAllData('stores').then(function(restaurants){
           if(restaurants.length) {
            console.log('IDB is being used to fetch data....-------->>>>>..');
            // console.log(Promise.resolve(restaurants));
           return Promise.resolve(restaurants);
       } else {
            console.log('FetchAPI is used to fetch data ....-------->>>>>..');

            return addDataFromFetchApi()
       }
   })
   .then(function(restaurants){
           callback(null, restaurants);
   })
   .catch(function(error){
           callback(error, null);
   })
   }

   /**
   * Fetch a restaurant by its ID.
   */

  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant

          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`dist/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }


    /** Reviews Code Starts Here.......**/


    static submitReview(data, callback) {
        return fetch('http://localhost:1337/reviews', {
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'POST',
        })
            .then(response => {
            response.json()
            .then(data => { writeReviewsData('reviewsStore',  data);
        return data;
    })
        callback(null)
    })
    .catch(error => {
            data['updatedAt'] = new Date().getTime();
            data['createdAt'] = new Date().getTime();

            writeReviewsDataOffline('review2',data);
    });
    }



/** Reviews helper function**/

//     static fetchReviewsForRestaurant(id, callback) {
//         console.log("Yahan tak aaya kya?");
//
//         //Checking if reviews in the IDB store reviewsStore
//         readReviewsData('reviewsStore',id).then(reviews => {
//             if (reviews && reviews.length > 0) {
//             // Continue with reviews from IDB by callback function error = null
//             callback(null, reviews);
//         }else{
//             // 2. Else If no reviews in the IDB then fetch reviews from the network.
//             addReviewsFromFetchApi(id);
//
//             callback(null,reviews);
//
//             }
//         })
// }


    static fetchReviewsForRestaurant(id, callback) {

        return dbPromise
            .then(db => {
            if (!db) return;
        // 1. Check if there are reviews in the IDB
        const tx = db.transaction('reviewsStore');
        const index = tx.objectStore('reviewsStore').index('restaurant_id');

        index.getAll(id).then(results => {
            if (results && results.length > 0) {
            // Continue with reviews from IDB
            console.log("2nd Time Biiatch");
            callback(null, results);
        }

        else {
            // 2. If there are no reviews in the IDB, fetch reviews from the network
            fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
                .then(response => {
                return response.json();
        })
        .then(reviews => {
                return dbPromise
                    .then(db => {
                if (!db) return;
            // 3. Put fetched reviews into IDB
            const tx = db.transaction('reviewsStore', 'readwrite');
 			const store = tx.objectStore('reviewsStore');
            console.log("Checkpoint1");
            console.log("Before reviews : " + reviews);
            var reviewCopy = reviews;

            reviews.forEach(review => {
                console.log("Checkpoint2");
                store.put(review);
            })
            callback(null, reviewCopy);
        });

            // Continue with reviews from network

        })
        .catch(error => {
                // Unable to fetch reviews from network
                callback(error, null);
        })
        }
    })
    });
    }



/*Set Favourite Button Helper function*/

static toggleFavoriteButton(restaurant,isFav,callback){
    restaurant.is_favourite = isFav;

    return fetch(`http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${isFav}`,{method: 'PUT'})
        .then(res =>{
            return res.json();
    })
    .then(data =>{
        return dbPromise
            .then(db => {
            if (!db) return;
    const tx = db.transaction('stores', 'readwrite');
    const store = tx.objectStore('stores');
    store.put(data);

            });
        callback(null);
        return data;


}).catch(error=>{
        dbPromise().then(db => {
        const tx = db.transaction('stores', 'readwrite');
    const store = tx.objectStore('stores');
    store.put(restaurant);

    const favorite2 = db.transaction('favorite2', 'readwrite');
    const favoritestore = favorite2.objectStore('favorite2');
    favoritestore.put(restaurant);

    callback(error);
}).catch(error => {
        console.log(error);
});
});
}


}