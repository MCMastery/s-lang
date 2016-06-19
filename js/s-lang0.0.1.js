var input, string, output;


window.addEventListener("load", function() {
    input = document.getElementById("input").value;
    string = document.getElementById("inputString").value;
    output = document.getElementById("output");
});

function nextChar(string, index) {
    return index >= string.length ? null : string.charAt(index + 1);
}
String.prototype.replaceAt = function(index, character) {
    return this.substr(0, index) + character + this.substr(index + character.length);
};
/*
example:
stringInBrackets("this [is a [good ] ]example", 5, '[', ']')
returns
"is a [good ] "
 */
function stringInBrackets(string, startIndex, startBracketSymbol, endBracketSymbol) {
    var layer = 0;
    for (var i = startIndex; i < string.length; i++) {
        if (string.charAt(i) == startBracketSymbol)
            layer++;
        else if (string.charAt(i) == endBracketSymbol) {
            layer--;
            if (layer == 0)
                return string.substring(startIndex + 1, i);
        }
    }
    return null;
}

function run() {
    input = document.getElementById("input").value;
    input = input.replaceAll("\n", "");
    string = document.getElementById("inputString").value;
    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        switch (char) {
            case 'r':
                var regex = new RegExp(".");
                if (nextChar(input, i) == '[') {
                    var reg = stringInBrackets(input, i + 1, '[', ']');
                    // skip over regex (and brackets)
                    i += reg.length + 2;
                    regex = new RegExp(reg);
                }
                /*
                 abcdefgabc
                 a|c|g
                 reverse chars: [a:0, c:2, g:6, a:7, c:9]
                 new string: cbadefgcba
                 */

                var reverseChars = [], reverseCharIndexes = [];
                for (var j = 0; j < string.length; j++) {
                    var c = string.charAt(j);
                    if (regex.test(c)) {
                        reverseChars.push(c);
                        reverseCharIndexes.push(j);
                    }
                }
                reverseChars = reverseChars.reverse();

                for (var j = 0; j < reverseCharIndexes.length; j++) {
                    var ch = reverseChars[j];
                    var index = reverseCharIndexes[j];
                    string = string.replaceAt(index, ch);
                }
                break;
        }
    }
    output.value = string;
}