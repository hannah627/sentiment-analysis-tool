"use strict";

(function() {

// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {
    id("input").addEventListener("input", test);
}

function test() {
    let inputtedText = id("input").value;
    id("result").textContent = inputtedText;
}



/**
 * a helper function to make returning an element based on id easier and faster
 * @param {string} idName - the id of the element to be located
 * @returns {Element} with id idName
 */
function id(idName) {
    return document.getElementById(idName);
}

/**
 * a helper function to make creating an element easier and faster
 * @param {string} tagName - the name of the element to create
 * @returns {Element} of type tagName
 */
function gen(tagName) {
    return document.createElement(tagName);
}

})();