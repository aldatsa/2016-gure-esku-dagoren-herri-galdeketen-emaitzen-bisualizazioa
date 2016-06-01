var gulp = require('gulp'),
    browserSync = require('browser-sync');

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function() {
    browserSync({
        server: {
            baseDir: 'public/'
        }
    });

    gulp.watch(['index.html', 'css/**/*.css', 'js/**/*.js', 'csv/*.csv'], {cwd: 'public/'}, reload);
});

gulp.task('kopiatuPublikora', function() {

    console.log("Beharrezko JS eta CSS fitxategiak bower_components karpetatik public karpetara kopiatzen...");

    // JS script fitxategiak kopiatu.
    gulp.src(['bower_components/c3/c3.min.js',
              'bower_components/d3/d3.min.js',
              'bower_components/index.js',
              'bower_components/topojson/topojson.js'], {
                  base: 'bower_components'
    }).pipe(gulp.dest('public/js'));

    // CSS fitxategiak kopiatu.
    gulp.src(['bower_components/c3/c3.min.css'], {
                  base: 'bower_components'
    }).pipe(gulp.dest('public/css'));
});

gulp.task('default', function() {
    // place code for your default task here
});
