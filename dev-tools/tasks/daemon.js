const Rx = require('rx');
const chok = require('chokidar');
// const bs = require('browser-sync').create();
var gulp = require('gulp');
var timeout = 2500;

module.exports = function() {
    // gulp.watch('styles/**/*.css', ['css']);
    // gulp.watch('public/**/*', ['assets']);
    // // gulp.watch('bower_components/**/*.css', ['css-watch']);
    // gulp.watch('js/**/*', ['js']);

    


    Rx.Observable.create(function(observer) {
            const watcher = chok
                .watch(['src/js/**/*', 'src/hak/**/*'], {
                    ignoreInitial: true
                })
                .on('all', function(event, file) {
                    observer.onNext({
                        event,
                        file
                    });
                });
            return function() {
                watcher.close();
            }
        })
        .debounce(timeout)
        .filter(function(x) {
            return x.event === 'add' || x.event === 'change';
        })
        .subscribe(function(x) {
            gulp.run('js');
        })

    Rx.Observable.create(function(observer) {
            const watcher = chok
                .watch(['src/css/**/*'], {
                    ignoreInitial: true
                })
                .on('all', function(event, file) {
                    observer.onNext({
                        event,
                        file
                    });
                });
            return function() {
                watcher.close();
            }
        })
        .debounce(timeout)
        .filter(function(x) {
            return x.event === 'add' || x.event === 'change';
        })
        .subscribe(function(x) {
            gulp.run('css');
        })
        
    
     Rx.Observable.create(function(observer) {
            const watcher = chok
                .watch(['src/public/**/*'], {
                    ignoreInitial: true
                })
                .on('all', function(event, file) {
                    observer.onNext({
                        event,
                        file
                    });
                });
            return function() {
                watcher.close();
            }
        })
        .debounce(timeout)
        .filter(function(x) {
            return x.event === 'add' || x.event === 'change';
        })
        .subscribe(function(x) {
            gulp.run('assets');
        });
};
