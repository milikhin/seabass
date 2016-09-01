define("ace/mode/qml_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(e, t, o) {
    "use strict";
    var n = e("../lib/oop"),
        r = e("./text_highlight_rules").TextHighlightRules,
        i = function() {
            this.$rules = {
                start: [{
                    token: "comment.block.documentation.qml",
                    regex: "/\\*(?!/)",
                    push: [{
                        token: "comment.block.documentation.qml",
                        regex: "\\*/",
                        next: "pop"
                    }, {
                        defaultToken: "comment.block.documentation.qml"
                    }],
                    comment: "Block comment."
                }, {
                    token: "comment.line.double-slash.qml",
                    regex: "//.*$",
                    comment: "Line comment."
                }, {
                    token: ["keyword.other.import.qml", "meta.import.qml"],
                    regex: "\\b(import)(\\s+)",
                    push: [{
                        token: "meta.import.qml",
                        regex: "$",
                        next: "pop"
                    }, {
                        token: ["entity.name.class.qml", "meta.import.namespace.qml", "constant.numeric.qml", "meta.import.namespace.qml", "keyword.other.import.qml", "meta.import.namespace.qml", "entity.name.class.qml"],
                        regex: "([\\w\\d\\.]+)(\\s+)(\\d+\\.\\d+)(?:(\\s+)(as)(\\s+)([A-Z][\\w\\d]*))?",
                        comment: "import Namespace VersionMajor.VersionMinor [as SingletonTypeIdentifier]"
                    }, {
                        token: ["string.quoted.double.qml", "meta.import.dirjs.qml", "keyword.other.import.qml", "meta.import.dirjs.qml", "entity.name.class.qml"],
                        regex: '(\\"[^\\"]+\\")(?:(\\s+)(as)(\\s+)([A-Z][\\w\\d]*))?',
                        comment: "import <string> [as Script]"
                    }, {
                        defaultToken: "meta.import.qml"
                    }],
                    comment: "import statement."
                }, {
                    token: "support.class.qml",
                    regex: "\\b[A-Z]\\w*\\b",
                    comment: "Capitalized word (class or enum)."
                }, {
                    token: "support.class.qml",
                    regex: "(?:(?:^|\\{)\\s*|\\b)on[A-Z]\\w*\\b",
                    comment: "onSomething - handler."
                }, {
                    token: ["meta.id.qml", "keyword.other.qml", "meta.id.qml", "storage.modifier.qml"],
                    regex: "(?:^|\\{)(\\s*)(id)(\\s*\\:\\s*)([^;\\s]+)\\b",
                    comment: "id: <something>"
                }, {
                    token: ["meta.propertydef.qml", "keyword.other.qml", "meta.propertydef.qml", "keyword.other.qml", "meta.propertydef.qml", "keyword.other.qml", "storage.type.qml", "meta.propertydef.qml", "entity.other.attribute-name.qml"],
                    regex: "^(\\s*)(?:(default|readonly)(\\s+))?(property)(\\s+)(?:(alias)|([\\w\\<\\>]+))(\\s+)(\\w+)",
                    comment: "property definition."
                }, {
                    token: ["keyword.other.qml", "meta.signal.qml", "support.function.qml", "meta.signal.qml"],
                    regex: "\\b(signal)(\\s+)(\\w+)(\\s*)",
                    push: [{
                        token: "meta.signal.qml",
                        regex: ";|(?=/)|$",
                        next: "pop"
                    }, {
                        token: ["storage.type.qml", "meta.signal.parameters.qml", "variable.parameter.qml"],
                        regex: "(\\w+)(\\s+)(\\w+)"
                    }, {
                        defaultToken: "meta.signal.qml"
                    }],
                    comment: "signal <signalName>[([<type> <parameter>[, ...]])]"
                }, {
                    token: ["constant.language.qml", "storage.type.qml", "keyword.control.qml"],
                    regex: "(?!:\\b|\\s+)(?:(true|false|null|undefined)|(var|void)|(on|as|enum|connect|break|case|catch|continue|debugger|default|delete|do|else|finally|for|if|in|instanceof|new|return|switch|this|throw|try|typeof|while|with))\\b",
                    comment: "js keywords."
                }, {
                    token: ["storage.type.qml", "meta.function.qml", "entity.name.function.untitled", "meta.function.qml"],
                    regex: "\\b(function)(\\s+)([\\w_]+)(\\s*)(?=\\()",
                    comment: "function definition."
                }, {
                    token: "support.function.qml",
                    regex: "\\b[\\w_]+\\s*(?=\\()",
                    comment: "function call."
                }, {
                    token: "entity.other.attribute-name.qml",
                    regex: "(?:^|\\{|;)\\s*[a-z][\\w\\.]*\\s*(?=\\:)",
                    comment: "property (property: <something>)."
                }, {
                    token: "default",
                    regex: "(?!:.+)\\.\\b\\w*",
                    comment: "property of the variable (name.property)."
                }, {
                    token: "variable.parameter",
                    regex: "\\b[a-z_]\\w*\\b",
                    comment: "All non colored words are assumed to be variables."
                }, {
                    include: "source.js"
                }, {
                    token: "string.quoted.double",
                    regex: '(\\"[^\\"]+\\")'
                }, {
                    token: "constant.numeric.qml",
                    regex: "(\\d+\\.\\d+)|(\\d+)"
                }, {
                    token: "keyword.operator",
                    regex: "(&&|\\|\\||and|or|=|<|>|\\+|-|\\*|\\/)"
                }]
            }, this.normalizeRules()
        };
    i.metaData = {
        fileTypes: ["qml", "qmlproject"],
        name: "QML",
        scopeName: "source.qml"
    }, n.inherits(i, r), t.QMLHighlightRules = i
}), define("ace/mode/folding/cstyle", ["require", "exports", "module", "ace/lib/oop", "ace/range", "ace/mode/folding/fold_mode"], function(e, t, o) {
    "use strict";
    var n = e("../../lib/oop"),
        r = e("../../range").Range,
        i = e("./fold_mode").FoldMode,
        m = t.FoldMode = function(e) {
            e && (this.foldingStartMarker = new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + e.start)), this.foldingStopMarker = new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + e.end)))
        };
    n.inherits(m, i),
        function() {
            this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/, this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/, this.getFoldWidgetRange = function(e, t, o, n) {
                var r = e.getLine(o),
                    i = r.match(this.foldingStartMarker);
                if (i) {
                    var m = i.index;
                    if (i[1]) return this.openingBracketBlock(e, i[1], o, m);
                    var l = e.getCommentFoldRange(o, m + i[0].length, 1);
                    return l && !l.isMultiLine() && (n ? l = this.getSectionRange(e, o) : "all" != t && (l = null)), l
                }
                if ("markbegin" !== t) {
                    var i = r.match(this.foldingStopMarker);
                    if (i) {
                        var m = i.index + i[0].length;
                        return i[1] ? this.closingBracketBlock(e, i[1], o, m) : e.getCommentFoldRange(o, m, -1)
                    }
                }
            }, this.getSectionRange = function(e, t) {
                var o = e.getLine(t),
                    n = o.search(/\S/),
                    i = t,
                    m = o.length;
                t += 1;
                for (var l = t, a = e.getLength(); ++t < a;) {
                    o = e.getLine(t);
                    var s = o.search(/\S/);
                    if (-1 !== s) {
                        if (n > s) break;
                        var c = this.getFoldWidgetRange(e, "all", t);
                        if (c) {
                            if (c.start.row <= i) break;
                            if (c.isMultiLine()) t = c.end.row;
                            else if (n == s) break
                        }
                        l = t
                    }
                }
                return new r(i, m, l, e.getLine(l).length)
            }
        }.call(m.prototype)
}), define("ace/mode/qml", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/qml_highlight_rules", "ace/range"], function(e, t, o) {
    "use strict";
    var n = e("../lib/oop"),
        r = e("./text").Mode,
        i = e("./qml_highlight_rules").QMLHighlightRules,
        m = e("ace/mode/folding/cstyle").FoldMode,
        l = function() {
            this.HighlightRules = i, this.foldingRules = new m
        };
    n.inherits(l, r),
        function() {
            this.$id = "ace/mode/qml"
        }.call(l.prototype), t.Mode = l
});
