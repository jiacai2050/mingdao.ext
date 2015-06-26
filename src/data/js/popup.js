window.onload = function () {
    document.getElementById("goOption").onclick = function() {
        chrome.tabs.create({ url: "data/options.html" });    
    }
}