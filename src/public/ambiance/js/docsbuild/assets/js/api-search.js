
/*
 * Copyright 2011 Yahoo! Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Yahoo! Inc. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL YAHOO! INC. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

YUI.add('api-search', function (Y) {

var Lang   = Y.Lang,
    Node   = Y.Node,
    YArray = Y.Array;

Y.APISearch = Y.Base.create('apiSearch', Y.Base, [Y.AutoCompleteBase], {
    // -- Public Properties ----------------------------------------------------
    RESULT_TEMPLATE:
        '<li class="result {resultType}">' +
            '<a href="{url}">' +
                '<h3 class="title">{name}</h3>' +
                '<span class="type">{resultType}</span>' +
                '<div class="description">{description}</div>' +
                '<span class="className">{class}</span>' +
            '</a>' +
        '</li>',

    // -- Initializer ----------------------------------------------------------
    initializer: function () {
        this._bindUIACBase();
        this._syncUIACBase();
    },

    // -- Protected Methods ----------------------------------------------------
    _apiResultFilter: function (query, results) {
        // Filter components out of the results.
        return YArray.filter(results, function (result) {
            return result.raw.resultType === 'component' ? false : result;
        });
    },

    _apiResultFormatter: function (query, results) {
        return YArray.map(results, function (result) {
            var raw  = Y.merge(result.raw), // create a copy
                desc = raw.description || '';

            // Convert description to text and truncate it if necessary.
            desc = Node.create('<div>' + desc + '</div>').get('text');

            if (desc.length > 65) {
                desc = Y.Escape.html(desc.substr(0, 65)) + ' &hellip;';
            } else {
                desc = Y.Escape.html(desc);
            }

            raw['class'] || (raw['class'] = '');
            raw.description = desc;

            // Use the highlighted result name.
            raw.name = result.highlighted;

            return Lang.sub(this.RESULT_TEMPLATE, raw);
        }, this);
    },

    _apiTextLocator: function (result) {
        return result.displayName || result.name;
    }
}, {
    // -- Attributes -----------------------------------------------------------
    ATTRS: {
        resultFormatter: {
            valueFn: function () {
                return this._apiResultFormatter;
            }
        },

        resultFilters: {
            valueFn: function () {
                return this._apiResultFilter;
            }
        },

        resultHighlighter: {
            value: 'phraseMatch'
        },

        resultListLocator: {
            value: 'data.results'
        },

        resultTextLocator: {
            valueFn: function () {
                return this._apiTextLocator;
            }
        },

        source: {
            value: '/api/v1/search?q={query}&count={maxResults}'
        }
    }
});

}, '3.4.0', {requires: [
    'autocomplete-base', 'autocomplete-highlighters', 'autocomplete-sources',
    'escape'
]});
