var inputElement;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function updateSize() {
    document.getElementById("size").innerHTML = inputElement.value.length.toString();
}

function getLink() {
    // see http://stackoverflow.com/questions/5817505/is-there-any-method-to-get-url-without-query-string-in-java-script
    document.getElementById("link").value = [location.protocol, '//', location.host, location.pathname].join('') + "?" + document.getElementById("input").value;
    $("#getLink").modal("show");
}
function copyLink() {
    document.getElementById("link").select();
    var result = document.getElementById("copyResult");
    try {
        document.execCommand('copy');
        result.innerHTML = "Successfully copied link.";
    } catch (err) {
        result.innerHTML = "Unable to copy link!";
    }
}

window.addEventListener("load", function() {
    inputElement = document.getElementById("input");
    // using a link with code built-in like: "http://www.dgrissom.com/?ImageScript code would be here"
    inputElement.value = decodeURIComponent(window.location.search.substr(1));
    // when using the window.location.search thing, it doesn't keep the line breaks, so we add them in automatically after each ";"
    inputElement.value = inputElement.value.replaceAll(";", ";\n");
    updateSize();
    if (inputElement.addEventListener) {
        inputElement.addEventListener('input', function() {
            updateSize();
        }, false);
    } else if (inputElement.attachEvent) {
        inputElement.attachEvent('onpropertychange', function() {
            updateSize();
        });
    }

    $('#getLink').on('hidden.bs.modal', function (e) {
        // reset copy result status
        document.getElementById("copyResult").innerHTML = "";
    })
});