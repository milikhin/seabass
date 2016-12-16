define([], function() {
    return {
        parseQueryString: function(str) {
            var ret = Object.create(null);

            if (typeof str !== 'string') {
                return ret;
            }

            str = str.trim().replace(/^(\?|#|&)/, '');

            if (!str) {
                return ret;
            }

            str.split('&').forEach(function(param) {
                var parts = param.replace(/\+/g, ' ').split('=');
                // Firefox (pre 40) decodes `%3D` to `=`
                // https://github.com/sindresorhus/query-string/pull/37
                var key = parts.shift();
                var val = parts.length > 0 ? parts.join('=') : undefined;

                key = decodeURIComponent(key);

                // missing `=` should be `null`:
                // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
                val = val === undefined ? null : decodeURIComponent(val);

                if (ret[key] === undefined) {
                    ret[key] = val;
                } else if (Array.isArray(ret[key])) {
                    ret[key].push(val);
                } else {
                    ret[key] = [ret[key], val];
                }
            });

            return ret;
        },


        showPreloader: function() {
            var preloaderElem = document.querySelector('.preloader');
            if (!preloaderElem) {
                console.log('Warning: progressbar not found');
                return;
            }

            preloaderElem.classList.remove('preloader-disabled');
            preloaderElem.classList.remove('preloader-hidden');
            return new Promise(function(resolve, reject) {
                setTimeout(resolve, 500);
            });
        },

        hidePreloader: function() {
            var preloaderElem = document.querySelector('.preloader');
            if (!preloaderElem) {
                console.log('Warning: progressbar not found');
                return;
            }
            preloaderElem.classList.add('preloader-hidden');
            setTimeout(function() {
                preloaderElem.classList.add('preloader-disabled');
            }, 700);
        }
    };
});