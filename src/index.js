"use strict";

(function() {

// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {
    id("input").addEventListener("input", processInputtedText);
    id("optionsSection").style.display = "none";
    id("toggleOptionsSectionBtn").addEventListener("click", toggleOptionsSection)
}

function toggleOptionsSection() {
    let optionsSection = id("optionsSection")
    let arrowButton = id("arrowBtn");
    // if (optionsSection.classList.contains(''))
    if (optionsSection.style.display === "none") {
        optionsSection.style.display = "block";
        arrowButton.classList.remove('down');
        arrowButton.classList.add('up')
    } else {
        optionsSection.style.display = "none";
        arrowButton.classList.remove('up');
        arrowButton.classList.add('down')
    }
}





function processInputtedText() {
    let inputtedText = id("input").value;
    let formatted_text = lowerCaseAndRemovePunctuationOfText(inputtedText)
    id("result").textContent = formatted_text;
}

function lowerCaseAndRemovePunctuationOfText(text) {
    let lowerCaseText = text.toLowerCase();
    let textWithoutPunctuation = lowerCaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    let textWithoutExtraSpaces = textWithoutPunctuation.replace(/\s{2,}/g," ");
    return textWithoutExtraSpaces;
}

function removeStopWords(text) {

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