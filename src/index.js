"use strict";

(function() {

const AFINN_LEXICON = "../lexicons/afinn-lexicon-en-165.txt";
const HISTORICAL_LEXICON = "../lexicons/lexicon-v1";

// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {
    // hiding things that shouldn't be visible when the page loads
    id("optionsSection").style.display = "none";
    id("customLexiconSection").style.display = "none";

    // adding general event listeners (options section button, main text input)
    id("toggleOptionsSectionBtn").addEventListener("click", toggleOptionsSectionVisibility);
    id("input").addEventListener("input", processInputtedText);
    id("inputfile").addEventListener("change", processInputFile);

    // finding lexicon option checkboxes and adding event listeners to them
    let lexiconOptions = document.querySelectorAll('input[name=lexicon]');
    lexiconOptions.forEach((e) => e.addEventListener("change", findLexicon));
    id("lexicon3").addEventListener("change", toggleCustomLexiconAreaVisibility);

}


function findLexicon() {
    let checkedBoxes = document.querySelectorAll('input[name=lexicon]:checked');
    let currentLexicons = [];
    checkedBoxes.forEach((e) => currentLexicons.push(e.value));

    console.log(currentLexicons);
    console.log(AFINN_LEXICON)

    for (let i = 0; i < currentLexicons.length; i++) {
        // fetch the file for the current lexicon
    }


}

function toggleCustomLexiconAreaVisibility() {
    let customLexiconSection = id("customLexiconSection");
    if (customLexiconSection.style.display === "none") {
        customLexiconSection.style.display = "flex";
    } else {
        customLexiconSection.style.display = "none"
    }

}

function toggleOptionsSectionVisibility() {
    let optionsSection = id("optionsSection")
    let arrowButton = id("arrowBtn");
    if (optionsSection.style.display === "none") {
        optionsSection.style.display = "flex";
        arrowButton.classList.remove('down');
        arrowButton.classList.add('up');
    } else {
        optionsSection.style.display = "none";
        arrowButton.classList.remove('up');
        arrowButton.classList.add('down');
    }
}





function processInputtedText() {
    let inputtedText = id("input").value;
    let formatted_text = lowerCaseAndRemovePunctuationOfText(inputtedText);
    id("result").textContent = formatted_text;
}

function processInputFile() {
    let fr = new FileReader();
    fr.onload = function() {
        let formatted_text = lowerCaseAndRemovePunctuationOfText(fr.result)
        id("result").textContent = formatted_text;
    }
    fr.readAsText(this.files[0]);
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