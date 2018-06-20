var gulp = require('gulp'),

concat = require('gulp-concat'),

uglify = require('gulp-uglifyes'),
plumber = require('gulp-plumber'),

sass = require('gulp-sass');
let babel = require('gulp-babel');

// let uglify = require('gulp-uglify-es').default;

var plumberNotifier = require('gulp-plumber-notifier');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence').use(gulp);
var rename = require('gulp-rename');

var minify = require('gulp-minify');
var uglifycss = require('gulp-uglifycss');
const webp = require('gulp-webp');


const imagemin = require('gulp-imagemin');

// Uglify JS
gulp.task('js', function(){
    return gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});


// Uglify css
gulp.task('css', function () {
    gulp.src('css/*.css')
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
        }))
        .pipe(gulp.dest('dist/css/uglified'));
});

//Minify js
gulp.task('compress', function() {
    gulp.src('dist/js/*.js')
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'.js'
            },
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '-min.js']
        }))
        .pipe(gulp.dest('dist/minify'))
});

//concat js files
gulp.task('scripts', function() {
    return gulp.src('dist/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});

//concat index.html's js bundle
gulp.task('scripts2', function() {
    return gulp.src(['js/app.js','js/idb.js','js/utility.js','js/dbhelper.js','js/main.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js/indexBundle'));
});

//concat restaurant.html's js bundle
gulp.task('scripts3', function() {
    return gulp.src(['js/app.js','js/idb.js','js/utility.js','js/dbhelper.js','js/restaurant_info.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js/restaurantBundle'));
});


// Uglify index JS bundle
gulp.task('js2', function(){
    return gulp.src('dist/js/indexBundle/all.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/uglifiedIndexBundle'))

});


// gulp.task('minjs', function () {
//     return gulp.src(['js/*.js'])
//         .pipe(plumberNotifier())
//         .pipe(sourcemaps.init())
//         .pipe(uglify({
//             mangle: false
//         }))
//         .pipe(babel({
//             presets: ['env']
//         }))
//         // .pipe(rename(function (path) {
//         //     path.extname = '.min.js';
//         // }))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('dist/js/uglifiedIndexBundle'));
// });




// Uglify index JS bundle
gulp.task('js3', function(){
    return gulp.src('dist/js/restaurantBundle/all.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/uglifiedRestaurantBundle'))
});


// CSS concat

gulp.task('styles', function(){
    return gulp.src('dist/css/*.css')
    .pipe(concat('all.css'))


    .pipe(gulp.dest('dist/css'))
});

//IMAGES jpg to webp
gulp.task('WebP', () =>
gulp.src('dist/img/minified/*.jpg')
    .pipe(webp())
    .pipe(gulp.dest('dist/img/webpAndMinified'))
);


gulp.task('WebP2', () =>
gulp.src('img/icons/*.png')
    .pipe(webp())
    .pipe(gulp.dest('dist/img/webp/icons'))
);


//minify jpg images
gulp.task('minifyImage', () =>
gulp.src('img/*.jpg')
    .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        imagemin.optipng({optimizationLevel: 5}),
        imagemin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(gulp.dest('dist/img/minified'))
);