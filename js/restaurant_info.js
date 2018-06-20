let restaurant;
let reviews;
var map;


/**
 * Initialize Google map, called from HTML.
 */

window.initMap = () =>
{
    fetchRestaurantFromURL((error, restaurant) => {
        if(error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 16,
            center: restaurant.latlng,
            scrollwheel: false
        });
    fillBreadcrumb();
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
}
})
    ;
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) =>
{
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
        if (!restaurant) {
            console.error(error);
            return;
        }
        fillRestaurantHTML();
        callback(null, restaurant)
    })
        ;
    }
}

/**
 * Fetch Reviews on first load
 * **/

fetchReviews = () =>
{
    console.log("FetchReviews runs ____________");
    const id = parseInt(getParameterByName('id'));
    if (!id) {
        console.log('No Id in URL to fetch Reviews');
        return;
    }
    console.log(id);
    DBHelper.fetchReviewsForRestaurant(id, (err, reviews) => {
        self.reviews = reviews;
    if (err || !reviews) {
        console.log('REVIEWS: fetching error ', err);
        return;
    }
    fillReviewsHTML();
});
}

setFavoriteButton = (status) => {
    const setFav = document.getElementById('setFav');
    if(status==='true'){
        setFav.src = "img/heart.svg";
    }else{setFav.src = "img/heart(1).svg";}

}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) =>
{
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    setFavoriteButton(restaurant.is_favorite);

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);

    image.alt = `${restaurant.name} restaurant`;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    // fill reviews
    fetchReviews();
}



/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/** Submit Reviews Code
 **/
formatDate = (ts) => {
    let date = new Date(ts);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}

let form = document.querySelector('#reviewForm');
form.addEventListener('submit', e => {
    e.preventDefault();
let rating = form.querySelector('#rating');

let review = {
    restaurant_id: parseInt(getParameterByName('id')),
    name: form.querySelector('#name').value,
    rating: rating.options[rating.selectedIndex].value,
    comments: form.querySelector('#comment').value

};

DBHelper.submitReview(review, (error) => {
    if(error) {
        console.log('Error: ' + error);
    }
}
).
then((data) => {
    const ul = document.getElementById('reviews-list');
review.createdAt = new Date();
review.updatedAt = new Date();
ul.appendChild(createReviewHTML(review));
form.reset();
}).
catch(error => {
    console.log(error);
}
);
});


/*Favourite img click event*/

let setFav = document.getElementById('setFav');
setFav.addEventListener('click', event => {

    const value = (self.restaurant.is_favorite === 'true') ? 'false' : 'true';

DBHelper.toggleFavoriteButton(self.restaurant, value, (error) => {
    if(error) {
        console.log(error);
    }

})
.then(() => {
    setFavoriteButton(value);
}).catch(error => {
    console.log(error);
}
);
});