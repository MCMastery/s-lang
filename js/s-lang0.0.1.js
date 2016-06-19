
function pregQuote(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: booeyOH
    // +   improved by: Ates Goral (http://magnetiq.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // *     example 1: preg_quote("$40");
    // *     returns 1: '\$40'
    // *     example 2: preg_quote("*RRRING* Hello?");
    // *     returns 2: '\*RRRING\* Hello\?'
    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

    return (str + '').replaceAll(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
}
String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
};
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.replaceAllIgnoreCase = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'gi'), replacement);
};
String.prototype.replaceAllNoRegex = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
String.prototype.replaceAllNoRegexIgnoreCase = function(search, replacement) {
    return this.replaceAllIgnoreCase(pregQuote(search), replacement);
};
Array.prototype.contains = function(element) {
    return this.indexOf(element) >= 0;
};
String.prototype.isAlphabetic = function() {
    return this.length === 1 && this.match(/[a-z]/i);
};
String.prototype.isUpperCase = function() {
    for (var i = 0; i < this.length; i++)
        if (this.charAt(i) != this.charAt(i).toUpperCase())
            return false;
    return true;
};




var input, string, output;


window.addEventListener("load", function() {
    input = document.getElementById("input").value;
    string = document.getElementById("inputString").value;
    output = document.getElementById("output");
});

function nextChar(string, index) {
    return index >= string.length ? null : string.charAt(index + 1);
}
function getArguments(string, functionIndex) {
    var args = [];
    for (var i = functionIndex; i < string.length - 1; i++) {
        var char = nextChar(string, i);
        if (char != '[')
            return args;
        var arg = stringInBrackets(string, i + 1, '[', ']');
        i += arg.length + 1;
        args.push(arg);
    }
    return args;
}
function getParamaters(string, functionIndex) {
    var params = [];
    for (var i = functionIndex + 1; i < string.length; i++) {
        var char = string.charAt(i);
        if (char == '[')
            return params;
        params.push(char);
    }
    return params;
}
function matchCase(text, pattern) {
    var caseMatch = text;
    for (var i = 0; i < pattern.length && i < text.length; i++) {
        var textChar = text.charAt(i), patternChar = pattern.charAt(i);
        if (patternChar.isAlphabetic())
            caseMatch = caseMatch.replaceAt(i, patternChar.isUpperCase() ? textChar.toUpperCase() : textChar.toLowerCase());
    }
    return caseMatch;
}

/*
example:
stringInBrackets("this [is a [good ] ]example", 5, '[', ']')
returns
"is a [good ] "
 */
function stringInBrackets(string, startIndex, startBracketSymbol, endBracketSymbol) {
    var layer = 0;
    var i;
    for (i = startIndex; i < string.length; i++) {
        if (string.charAt(i) == startBracketSymbol)
            layer++;
        else if (string.charAt(i) == endBracketSymbol) {
            layer--;
            if (layer == 0)
                return string.substring(startIndex + 1, i);
        }
    }
    // last bracket not given. assume this is to save a byte, and use the last text as argument
    return string.substring(startIndex + 1, i);
}

function run() {
    input = document.getElementById("input").value;
    input = input.replaceAll("\n", "");
    string = document.getElementById("inputString").value;

    var selection = [];
    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        switch (char) {
            // reverse
            case 'r':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);

                /*
                 abcdefgabc
                 a|c|g
                 reverse chars: [a:0, c:2, g:6, a:7, c:9]
                 new string: cbadefgcba
                 */

                var reverseChars = [], reverseCharIndexes = [];
                var useSelection = args.length == 0 && selection.length != 0;
                if (useSelection) {
                    reverseCharIndexes = selection;
                    for (var j = 0; j < reverseCharIndexes.length; j++)
                        reverseChars[j] = string.charAt(reverseCharIndexes[j]);
                } else {
                    for (var j = 0; j < string.length; j++) {
                        var c = string.charAt(j);
                        if (regex.test(c)) {
                            reverseChars.push(c);
                            reverseCharIndexes.push(j);
                        }
                    }
                }
                reverseChars = reverseChars.reverse();

                for (var j = 0; j < reverseCharIndexes.length; j++) {
                    var ch = reverseChars[j];
                    var index = reverseCharIndexes[j];
                    string = string.replaceAt(index, ch);
                }
                break;


            // capitalize
            case 'c':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);

                var useSelection = args.length == 0 && selection.length != 0;
                if (useSelection) {
                    for (var j = 0; j < selection.length; j++) {
                        var index = selection[j];
                        string = string.replaceAt(index, string.charAt(index).toUpperCase());
                    }
                } else {
                    for (var j = 0; j < string.length; j++) {
                        var c = string.charAt(j);
                        if (regex.test(c))
                            string = string.replaceAt(j, c.toUpperCase());
                    }
                }
                break;

            // lower case
            case 'C':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);

                var useSelection = args.length == 0 && selection.length != 0;
                if (useSelection) {
                    for (var j = 0; j < selection.length; j++) {
                        var index = selection[j];
                        string = string.replaceAt(index, string.charAt(index).toLowerCase());
                    }
                } else {
                    for (var j = 0; j < string.length; j++) {
                        var c = string.charAt(j);
                        if (regex.test(c))
                            string = string.replaceAt(j, c.toLowerCase());
                    }
                }
                break;

            // replace with regex
            case 't':
                var params = getParamaters(input, i);
                var args = getArguments(input, i + params.length);
                var search = args[0], replace = args[1];
                i += params.length + (search.length + 2) + (replace.length + 2);
                // p parameter = preserve case
                if (params.contains('p')) {
                    string = string.replaceAllIgnoreCase(search, function(match) {
                        return matchCase(replace, match);
                    });
                } else
                    string = string.replaceAll(search, replace);
                break;

            // replace without regex
            case 'T':
                var params = getParamaters(input, i);
                var args = getArguments(input, i + params.length);
                var search = args[0], replace = args[1];
                i += params.length + (search.length + 2) + (replace.length + 2);
                // p parameter = preserve case
                if (params.contains('p')) {
                    string = string.replaceAllNoRegexIgnoreCase(search, function(match) {
                        return matchCase(replace, match);
                    });
                } else
                    string = string.replaceAllNoRegex(search, replace);
                break;





            // select with optional regex (otherwise, selects all input)
            case 's':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);
                selection = [];
                for (var j = 0; j < string.length; j++)
                    if (regex.test(string.charAt(j)))
                        selection.push(j);
                console.log(selection);
                break;

            // append to selection with optional regex (otherwise, selects all input)
            case 'a':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);
                for (var j = 0; j < string.length; j++)
                    if (regex.test(string.charAt(j)))
                        selection.push(j);
                console.log(selection);
                break;

            // delete from selection with optional regex (otherwise, selects all input)
            case 'A':
                var args = getArguments(input, i);
                if (args.length != 0)
                    i += args[0].length + 2;
                var regex = (args.length == 0) ? new RegExp(".") : new RegExp(args[0]);
                for (var j = 0; j < string.length; j++) {
                    if (regex.test(string.charAt(j))) {
                        var index = selection.indexOf(j);
                        if (index >= 0)
                            selection.splice(index, 1);
                    }
                }
                console.log(selection);
                break;

            // clears the selection
            case 'S':
                selection = [];
                console.log(selection);
                break;
        }
    }
    output.value = string;
}