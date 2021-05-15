const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat'); //собираем в один 
const uglify = require('gulp-uglify-es').default; // сжимаем
const less = require('gulp-less'); //less
const autoprefixer = require('gulp-autoprefixer'); //autoprifix
const cleancss = require('gulp-clean-css'); //очищаем
const imagemin = require('gulp-imagemin'); //сжимаем картинки
const newer = require('gulp-newer'); //следит за изображениеми которые были изменены или нет
const del = require('del'); //очистка 
const pug = require('gulp-pug');
const rename = require('gulp-rename');
const fs = require('fs');
const data = require('gulp-data')
// const jsonServer = require("gulp-json-srv");
// const server = jsonServer.create({
//     port: 25000,
// });


// function startServer() {
//     return src("./data.json")
//         .pipe(server.pipe());
// }



//browsersync
function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/',
        },
        notify: false,
        online: true
    })
}


//Pug
function pugTask() {
    return src('app/**/*.pug')
        .pipe(data(function (file) {
            return JSON.parse(fs.readFileSync('./data.json'));
        }))
        .pipe(pug({
            pretty: true,
        }))
        .pipe(rename('./index.html'))
        .pipe(dest('app'))
}


// scripts app.min.js
function scripts() {
    return src([

        // 'node_modules/jquery/dist/jquery.min.js',
        'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
       
        // 'node_modules/owl.carousel/dist/owl.carousel.min.js',

    ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js/')) //выгрузка
        .pipe(browserSync.stream())
}

// scripts main.js
function scriptsApp() {
    return src([
        'app/js/app.js'
    ])
        .pipe(dest('app/js/')) //выгрузка
        .pipe(browserSync.stream())
}

//less
function styleLess() {
    return src('app/less/**/*.less', { dot: true, ignore: 'app/less/app.less' })
        .pipe(less())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}

//css app.min.css
function styleCleanMin() {
    return src('app/less/app.less')
        .pipe(less())
        .pipe(concat('app.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 versions'],
            grid: true
        }))
        .pipe(cleancss(({
            level: {
                1: {
                    specialComments: 0
                }
            },
            //        format:'beautify'
        })))
        .pipe(dest('app/css/'))
        .pipe(browserSync.stream())
}


//images
function images() {
    return src('app/img/src/**/*')
        // .pipe(newer('app/img/dest/'))
        // .pipe(imagemin())
        .pipe(dest('app/img/src/'))
}

//cleanimg          
function cleanimg() {
    return del('app/img/dest/**/*', {
        force: true
    })
}

//cleanDist
function cleanDist() {
    return del('dist/**/*', {
        force: true
    })
}


//buildCopy
function buildCopy() {
    return src([
        'app/css/**/*.css',
        'app/js/**/*.min.js',
        'app/js/app.js',
        'app/img/dest/**/*',
        'app/**/*.html',
    ], {
        base: 'app'
    })
        .pipe(dest('dist'))
}


//watch
function startwatch() {
    watch('app/**/*.less', styleLess)
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/*.pug', pugTask).on('change', browserSync.reload);
    watch('app/**/*.html').on('change', browserSync.reload);
    watch('app/img/src/**/*', images);
}


exports.browsersync = browsersync;
// exports.startServer = startServer
exports.scripts = scripts;
exports.scriptsApp = scriptsApp;
exports.styleLess = styleLess;
exports.pugTask = pugTask;
exports.images = images;
exports.cleanimg = cleanimg;
exports.styleCleanMin = styleCleanMin;
//exports.cleanDist = cleanDist;
exports.build = series(cleanDist, styleLess, styleCleanMin, scripts, scriptsApp, images, buildCopy);

exports.default = parallel(pugTask, styleLess, styleCleanMin, scripts, scriptsApp, browsersync, startwatch);
