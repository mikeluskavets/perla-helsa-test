(() => {
    'use strict';
    /**************** gulpfile.js configuration ****************/
    const
        // development or production
        devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
        // directory locations
        dir = {
            src: 'src/',
            build: 'web/assets/',
        },

        // modules
        gulp = require('gulp'),
        minimist = require('minimist')(process.argv.slice(2)),
        noWatch = minimist.nowatch,
        noop = require('gulp-noop'),
        newer = require('gulp-newer'),
        size = require('gulp-size'),
        sass = require('gulp-sass')(require('sass')),
        postcss = require('gulp-postcss'),
        sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
        imagemin = require('gulp-imagemin'),
        imageminMozjpeg = require('imagemin-mozjpeg'),
        merge = require('merge-stream'),
        babel = require('gulp-babel'),
        uglify = require('gulp-uglify'),
        concat = require("gulp-concat");

    console.log('Gulp', devBuild ? 'development' : 'production', 'build');

    /**************** CSS task ****************/
    const cssConfig = {
        src: dir.src + 'scss/styles.scss',
        watch: dir.src + 'scss/**/*',
        build: dir.build + 'css/',
        sassOpts: {
            outputStyle: 'compressed',
            sourceMap: devBuild,
            imagePath: dir.src + 'img/',
            precision: 3,
            errLogToConsole: true
        },
        postCSS: [
            require('postcss-assets')({
                loadPaths: [dir.src + 'img/'],
                basePath: dir.build + 'img/'
            }),
            require('autoprefixer'),
            require('cssnano')
        ]
    };

    function css() {
        const _scss = gulp.src(cssConfig.src)
            .pipe(sourcemaps ? sourcemaps.init() : noop())
            .pipe(sass(cssConfig.sassOpts).on('error', sass.logError))
            .pipe(postcss(cssConfig.postCSS))
            .pipe(size({showFiles: true}));

        return merge(_scss)
            .pipe(concat('styles.min.css'))
            .pipe(sourcemaps ? sourcemaps.write() : noop())
            .pipe(gulp.dest(cssConfig.build));
    }

    /**************** images task ***************
     const imgConfig = {
    src           : dir.src + 'img/*',
    watch         : dir.src + 'img/*',
    build         : dir.build + 'img/',
    minOpts:
        [
          imageminMozjpeg({
            quality: 80
          })
        ]
  };

     function images() {
    return gulp.src(imgConfig.src)
        .pipe(newer(imgConfig.build))
        .pipe(imagemin(imgConfig.minOpts))
        .pipe(size({ showFiles:true }))
        .pipe(gulp.dest(imgConfig.build));
  }*/


    /**************** JS task ****************/
    const jsConfig = {
        src: dir.src + 'js/*.js',
        watch: dir.src + 'js/**/*',
        build: dir.build + 'js/'
    };

    function js() {
        return gulp.src(jsConfig.src)
            .pipe(sourcemaps.init())
            .pipe(concat('scripts.min.js'))
            .pipe(babel({
                presets: ['@babel/env']
            }))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(jsConfig.build));
    }

    exports.assets = gulp.series(js, css/*,images*/);

    /**************** watch task ****************/
    function watch(done) {
        // CSS changes
        gulp.watch(cssConfig.watch, css);
        //gulp.watch(imgConfig.watch, images);
        gulp.watch(jsConfig.watch, js);
        done();
    }

    /**************** default task ****************/
    if (noWatch) {
        exports.default = gulp.series(exports.assets);
    } else{
        exports.default = gulp.series(exports.assets, watch);
    }

})();
