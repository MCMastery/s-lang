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

// represents an inclusive range of indices for use in an array
function Range(start, end) {
    this.start = start;
    this.end = end;
    // returns an array of integers from start to end
    this.asArray = function() {
        var array = [];
        for (var i = this.start; i <= this.end; i++)
            array.push(i);
        return array;
    };
    this.contains = function(index) {
        return index >= this.start && index <= this.end;
    }
}


Array.prototype.contains = function(element) {
    return this.indexOf(element) >= 0;
};
// use range object
Array.prototype.range = function(range) {
    // + 1 since ranges are inclusive
    return this.slice(range.start, range.end + 1);
};
// see http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
Array.prototype.removeDuplicates = function() {
    var prims = {"boolean" : {}, "number" : {}, "string" : {}}, objs = [];

    return this.filter(function(item) {
        var type = typeof item;
        if (type in prims)
            return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
        else
            return objs.indexOf(item) >= 0 ? false : objs.push(item);
    });
};


String.prototype.replaceAt = function(index, character) {
    return this.substring(0, index) + character + this.substring(index + character.length);
};
// range object
String.prototype.replaceRange = function(range, character) {
    return this.substring(0, range.start) + character + this.substring(range.end + 1); // +1 since ranges are inclusive
};
// range object
String.prototype.getRange = function(range) {
    return this.substring(range.start, range.end + 1); // +1 since ranges are inclusive
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
function getParameters(string, functionIndex) {
    var params = [];
    for (var i = functionIndex + 1; i < string.length; i++) {
        var char = string.charAt(i);
        if (char == '[' || char.isAlphabetic())
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


// converts array of ranges to array of indices (and removes duplicate indices)
function selectionToIndexArray(selection) {
    var indices = [];
    for (var i = 0; i < selection.length; i++) {
        var indexArray = selection[i].asArray();
        for (var j = 0; j < indexArray.length; j++)
            indices.push(indexArray[j]);
    }
    return indices.removeDuplicates();
}
function indexArrayToSelection(indexArray) {
    var selection = [];
    for (var i = 0; i < indexArray.length; i++)
        selection.push(new Range(indexArray[i], indexArray[i]));
    return selection;
}






// removes the ranges in arrayTwo from arrayOne, and returns the new array
function subtractRangeArrays(arrayOne, arrayTwo) {
    var indexArrayOne = selectionToIndexArray(arrayOne),
        indexArrayTwo = selectionToIndexArray(arrayTwo);
    var subtraction = indexArrayOne;
    for (var i = 0; i < indexArrayTwo.length; i++) {
        var index = indexArrayOne.indexOf(indexArrayTwo[i]);
        if (index >= 0)
            subtraction.splice(index, 1);
    }
    return optimizeRanges(indexArrayToSelection(subtraction));
}
// ex: converts [{0, 5}, {3, 10}] to [{0, 10}]
// assumes ranges' lengths are > 1 (not {3, 1})
// still needs some more testing
function optimizeRanges(rangeArray) {
    /*
    test case:
    [{0, 2}, {2, 4}] -> true
    [{0, 0}, {-1, 1}] -> true
    [{3, 7}, {4, 5}] -> true
    [{0, 4}, {5, 7}] -> true
     */
    function rangesConnect(rangeOne, rangeTwo) {
        // if one range's value is contained in the other
        if (rangeTwo.contains(rangeOne.start) || rangeTwo.contains(rangeOne.end)
            || rangeOne.contains(rangeTwo.start) || rangeOne.contains(rangeTwo.end))
            return true;
        // if rangeOne's values is 1 away from the other (see test case 4)
        else if (rangeTwo.contains(rangeOne.start - 1) || rangeTwo.contains(rangeOne.start + 1)
            || rangeTwo.contains(rangeOne.end - 1) || rangeTwo.contains(rangeOne.end + 1))
            return true;
        // same thing, but for rangeTwo
        else if (rangeOne.contains(rangeTwo.start - 1) || rangeOne.contains(rangeTwo.start + 1)
            || rangeOne.contains(rangeTwo.end - 1) || rangeOne.contains(rangeTwo.end + 1))
            return true;
        return false;
    }

    var optimizedRanges = [];
    // sort ranges based on starting positions
    rangeArray = rangeArray.sort(function(a, b) {
        if (a.start == b.start)
            return 0;
        else if (a.start < b.start)
            return -1;
        return 1;
    });
    var compactedRange = null;
    for (var i = 0; i < rangeArray.length; i++) {
        var range = rangeArray[i];
        if (compactedRange == null)
            compactedRange = range;
        else {
            if (rangesConnect(compactedRange, range)) {
                // expand compacted range to match range's bounds
                compactedRange.start = Math.min(compactedRange.start, range.start);
                compactedRange.end = Math.max(compactedRange.end, range.end);
            } else {
                optimizedRanges.push(compactedRange);
                compactedRange = range;
            }
        }
    }
    if (compactedRange != null)
        optimizedRanges.push(compactedRange);
    return optimizedRanges;
}
// IMPORTANT: REGEX GIVEN MUST BE STRING!!!!!!
function getSelection(string, regexString, ignoreCase) {
    // create regex to keep delimiters, as separate elements
    // the delimiters in this case are the matches strings we are selecting by the regex
    var params = "g";
    if (ignoreCase)
        params += "i";
    var split = string.split(new RegExp("(" + regexString + ")", params));
    var rangeArray = [];
    var index = 0;
    for (var i = 0; i < split.length; i++) {
        var str = split[i];
        // if this string element of split is a delimiter, add its range to the selection
        if (i % 2 == 1) {
            var range = new Range(index, index + str.length - 1); // -1 since range is inclusive
            rangeArray.push(range);
        }
        index += str.length;
    }
    return optimizeRanges(rangeArray);
}
// splits a string into a range array
// IMPORTANT: REGEX GIVEN MUST BE STRING!!!!!!
function splitStringIntoSelection(string, regexString) {
    // create regex to keep delimiters, as separate elements
    var split = string.split(new RegExp("(" + regexString + ")", "g"));
    var rangeArray = [];
    var index = 0;
    for (var i = 0; i < split.length; i++) {
        var str = split[i];
        // if this string element of split is a delimiter, continue on (delimiters would all be odd-numbered indices, since they separate the real strings)
        if (i % 2 == 1)
            index += str.length;
        else if (str.length == 0) {
            // string is empty, since two delimiters were next to each other in the given string.
        }
        else {
            var range = new Range(index, index + str.length - 1); // -1 since range is inclusive
            rangeArray.push(range);
            index += str.length;
        }
    }
    return rangeArray;
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

    console.log("Running code " + input + " with input string " + string);

    // selection is an array of range objects
    var selection = [];
    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        var params = getParameters(input, i);
        var args = getArguments(input, i + params.length);
        console.log("Evaluation function " + char);
        switch (char) {
            // reverse
            case 'r':
                var regex = (args.length == 0) ? "." : args[0];
                /*
                 abcdefgabc
                 a|c|g
                 reverse chars: [a:0, c:2, g:6, a:7, c:9]
                 new string: cbadefgcba
                 */

                function StringInfo(string, range) {
                    this.string = string;
                    this.range = range;
                    this.reverse = function() {
                        return this.string.split("").reverse().join("");
                    }
                }

                var reverseStrings = [];
                var useSelection = args.length == 0 && selection.length != 0;
                var reverseSelection = (useSelection) ? selection : getSelection(string, regex, params.contains('!')); // ! param = ignore case
                for (var j = 0; j < reverseSelection.length; j++) {
                    var range = reverseSelection[j];
                    reverseStrings.push(new StringInfo(string.getRange(range), range));
                }

                if (params.contains('@')) // @ param = reverse groups of words (uses ranges), not the whole selection as one
                    for (var j = 0; j < reverseStrings.length; j++)
                        string = string.replaceRange(reverseStrings[j].range, reverseStrings[j].reverse());
                else {
                    //todo find better way of doing this
                    // convert reverseStrings to array of single characters
                    var reverseCharacters = [], reverseIndexes = [];
                    for (var j = 0; j < reverseStrings.length; j++) {
                        var stringInfo = reverseStrings[j];
                        for (var k = 0; k < stringInfo.string.length; k++) {
                            var index = stringInfo.range.start + k;
                            reverseCharacters.push(stringInfo.string.charAt(k));
                            reverseIndexes.push(index);
                        }
                    }

                    // reverse array
                    reverseCharacters = reverseCharacters.reverse();

                    // replace
                    for (var j = 0; j < reverseIndexes.length; j++) {
                        var ch = reverseCharacters[j];
                        var index = reverseIndexes[j];
                        string = string.replaceAt(index, ch);
                    }
                }


                // var reverseChars = [], reverseCharIndexes = [];
                // var useSelection = args.length == 0 && selection.length != 0;
                // if (useSelection) {
                //     reverseCharIndexes = selectionToIndexArray(selection);
                //     for (var j = 0; j < reverseCharIndexes.length; j++)
                //         reverseChars[j] = string.charAt(reverseCharIndexes[j]);
                // } else {
                //     for (var j = 0; j < string.length; j++) {
                //         var c = string.charAt(j);
                //         if (regex.test(c)) {
                //             reverseChars.push(c);
                //             reverseCharIndexes.push(j);
                //         }
                //     }
                // }
                // reverseChars = reverseChars.reverse();
                //
                // for (var j = 0; j < reverseCharIndexes.length; j++) {
                //     var ch = reverseChars[j];
                //     var index = reverseCharIndexes[j];
                //     string = string.replaceAt(index, ch);
                // }
                break;


            // capitalize
            case 'c':
                var regex = (args.length == 0) ? "." : args[0];
                var useSelection = args.length == 0 && selection.length != 0;
                var ranges;
                if (!useSelection)
                    ranges = getSelection(string, regex); // get selection from regex
                else
                    ranges = selection;

                // only capitalize first letter
                for (var j = 0; j < ranges.length; j++) {
                    var range = ranges[j];
                    // make first letter capital
                    if (params.contains('!'))
                        string = string.replaceAt(range.start, string.charAt(range.start).toUpperCase());
                    else
                        string = string.replaceRange(range, string.getRange(range).toUpperCase())
                }
                break;

            // lower case
            case 'C':
                var regex = (args.length == 0) ? "." : args[0];
                var useSelection = args.length == 0 && selection.length != 0;
                var ranges;
                if (!useSelection)
                    ranges = getSelection(string, regex); // get selection from regex
                else
                    ranges = selection;

                // only lower case first letter
                for (var j = 0; j < ranges.length; j++) {
                    var range = ranges[j];
                    // make first letter capital
                    if (params.contains('!'))
                        string = string.replaceAt(range.start, string.charAt(range.start).toLowerCase());
                    else
                        string = string.replaceRange(range, string.getRange(range).toLowerCase())
                }
                break;

            // replace with regex
            case 't':
                var search = args[0], replace = args[1];
                // preserve case
                if (params.contains('!')) {
                    string = string.replaceAllIgnoreCase(search, function(match) {
                        return matchCase(replace, match);
                    });
                } else
                    string = string.replaceAll(search, replace);
                break;

            // replace without regex
            case 'T':
                var search = args[0], replace = args[1];
                // preserve case
                if (params.contains('!')) {
                    string = string.replaceAllNoRegexIgnoreCase(search, function(match) {
                        return matchCase(replace, match);
                    });
                } else
                    string = string.replaceAllNoRegex(search, replace);
                break;




            // single index selecting


            // append to selection with optional regex (otherwise, selects all input)
            case 's':
                var regex = (args.length == 0) ? "." : args[0];
                // ignore case
                var selectionAddition = getSelection(string, regex, params.contains('!')); // if "!" parameter is given, ignore case
                selection = selection.concat(selectionAddition);
                break;

            // delete from selection with optional regex (otherwise, selects all input)
            case 'd':
                var regex = (args.length == 0) ? "." : args[0];
                var selectionDeletion = getSelection(string, regex, params.contains('!'));
                selection = subtractRangeArrays(selection, selectionDeletion);
                break;

            // clears the selection
            case 'S':
                selection = [];
                break;



            // loop
            case 'l':

                break;




            // range selecting
            // "split" - splits the input string by given regex and adds resulting strings to selection
            case 'w':
                var regex = args[0];
                var split = splitStringIntoSelection(string, regex);
                selection = selection.concat(split);
                break;
        }


        // increment counter based on parameters and arguments lengths
        for (var j = 0; j < args.length; j++)
            i += args[j].length + 2;
        i += params.length;
    }

    string = string.replaceAllNoRegex("\\n", "\n");
    output.value = string;
}