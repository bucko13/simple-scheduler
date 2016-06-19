/*
* Following gulpfile is based off original by  Jean-Pierre Sierens
* http://jpsierens.com/tutorial-gulp-javascript-2015-react/
*/

// declarations, dependencies
// ----------------------------------------------------------------------------
'use strict'
const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const gutil = require('gulp-util');
const babelify = require('babelify');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
const dependencies = [
  'react',
  'react-dom',
];
// keep a count of the times a task refires
let scriptsCount = 0;

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', function () {
    bundleApp(false);
});

gulp.task('deploy', function (){
  bundleApp(true);
});

gulp.task('watch', function () {
  gulp.watch(['./public/components/*.js'], ['scripts']);
});

// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes in every .js file.
// If there's a change, the task 'scripts' defined above will fire.
gulp.task('default', ['scripts','watch']);

const bundleApp = isProduction => {
  scriptsCount++;
    // Browserify will bundle all our js files together in to one and will let
    // us use modules in the front end.
    var appBundler = browserify({
        entries: './public/index.js',
        debug: true
      })

    // If it's not for production, a separate vendors.js file will be created
    // the first time gulp is run so that we don't have to rebundle things like
    // react everytime there's a change in the js file
      if (!isProduction && scriptsCount === 1){
        // create vendors.js for dev environment.
        browserify({
        require: dependencies,
        debug: true
      })
        .bundle()
        .on('error', gutil.log)
        .pipe(source('vendors.js'))
        .pipe(gulp.dest('./public/js/'));
      }
      if (!isProduction){
        // make the dependencies external so they dont get bundled by the
      // app bundler. Dependencies are already bundled in vendor.js for
      // development environments.
        dependencies.forEach(function(dep){
          appBundler.external(dep);
        })
      }

      appBundler
        // transform ES6 and JSX to ES5 with babelify
        .transform("babelify", {presets: ["es2015", "react"]})
        .bundle()
        .on('error',gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/js/'));

}
