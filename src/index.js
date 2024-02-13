"use strict";

(function() {

const AFINN_LINK = "lexicons/afinn-lexicon-en-165.txt";
const HISTORICAL_LINK = "lexicons/lexicon-v1.txt";

const NTLK_STOPWORDS_LINK = "stop_words_lists/ntlk_stop_words.txt";
const TOOL_STOPWORDS_LINK = "stop_words_lists/custom_stop_words.txt";

let AFINN_obj = {};
let historicalLexiconObj = {};
let customLexiconObj = {};

let ntlkStopwordsList = [];
let toolStopwordsList = [];
let customStopwordsList = [];


let currentLexicons = ['AFINN_en', 'historical'];
let currentStopwords = ['ntlk', 'tool'];


// when the page loads, call "init"
window.addEventListener("load", init);


// the function that runs when the page loads;
function init() {

    getFileLexicons(); // creates global JSON lexicon objects for the AFINN and historical lexicons
    getFileStopWords();

    // hiding things that shouldn't be visible when the page loads
    id("optionsSection").style.display = "none";
    id("customLexiconSection").style.display = "none";
    id("customStopwordsSection").style.display = "none";

    // adding general event listeners (options section button, main text input)
    id("toggleOptionsSectionBtn").addEventListener("click", toggleOptionsSectionVisibility);
    id("input").addEventListener("input", processInputtedText);
    id("inputfile").addEventListener("change", processInputtedFile);

    // finding lexicon option checkboxes and adding event listeners to them
    let lexiconOptions = document.querySelectorAll('input[name=lexicon]');
    lexiconOptions.forEach((e) => e.addEventListener("change", updateSelectedLexicons));

    id("lexicon3").addEventListener("change", function() { toggleTextAreaVisibility("customLexiconSection"); });
    id("stopwords2").addEventListener("change", function() { toggleTextAreaVisibility("customStopwordsSection"); });

}



async function getFileLexicons() {
// call this once when page loads; make JSON lexicons for both, then save those to variables
// then use another function to decide which of the lexicon vars to use
    Promise.all([
        fetch(AFINN_LINK).then(x => x.text()),
        fetch(HISTORICAL_LINK).then(x => x.text())
    ]).then(([afinnLexicon, historicalLexicon]) => {
        processFileLexicon(afinnLexicon, '\t', AFINN_obj);
        processFileLexicon(historicalLexicon, ' ', historicalLexiconObj);
    });
}

function processFileLexicon(lexicon, separator, lexiconObj) {
    let lines = lexicon.split('\n');
    lines.forEach((line) => {
        let [word, score] = line.split(separator);

        lexiconObj[word] = score;
    })
}


async function getFileStopWords() {
    Promise.all([
        fetch(NTLK_STOPWORDS_LINK).then(x => x.text()),
        fetch(TOOL_STOPWORDS_LINK).then(x => x.text())
    ]).then(([ntlk_stopwords, tool_stopwords]) => {
        processFileStopwords(ntlk_stopwords, ntlkStopwordsList);
        processFileStopwords(tool_stopwords, toolStopwordsList);
    });
}

function processFileStopwords(list, resultList) {
    let terms = list.split('\n');
    terms.forEach((term) => {
        resultList.push(term);
    })
}



function toggleTextAreaVisibility(sectionID) {
    let textAreaSection = id(sectionID);
    if (textAreaSection.style.display === "none") {
        textAreaSection.style.display = "flex";
    } else {
        textAreaSection.style.display = "none"
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
    processText(inputtedText);
}

function processInputtedFile() {
    let fr = new FileReader();
    fr.onload = function() {
        let file_text = fr.result;
        processText(file_text);
    }
    fr.readAsText(this.files[0]);
}

function processText(text) {
    let formatted_text = lowerCaseAndRemovePunctuationOfText(text);
    let tokens = tokenizeText(formatted_text);

    let stopwordsList = makeFullStopwordsList();
    let filteredTokens = removeStopWords(tokens, stopwordsList);

    let lexicon = makeFullLexicon();
    scoreText(filteredTokens, lexicon);
}






function lowerCaseAndRemovePunctuationOfText(text) {
    let lowerCaseText = text.toLowerCase();
    let textWithoutPunctuation = lowerCaseText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    let textWithoutExtraSpaces = textWithoutPunctuation.replace(/\s{2,}/g," ");
    return textWithoutExtraSpaces;
}

function tokenizeText(text) {
    // this process of splitting and joining is done to ensure that both newline chars and spaces are removed
    let tokens_with_newline_chars = text.split(' ');
    let rejoined_tokens = tokens_with_newline_chars.join('\n');
    let clean_tokens = rejoined_tokens.split('\n');
    return clean_tokens;
}


function updateSelectedLexicons() {
    let checkedBoxes = document.querySelectorAll('input[name=lexicon]:checked');
    let selectedLexicons = [];
    checkedBoxes.forEach((e) => selectedLexicons.push(e.value));

    currentLexicons = selectedLexicons;
}

function makeFullLexicon() { // does not yet include custom lexicon
    let fullLexicon = {};
    if (currentLexicons.includes('AFINN_en')) {
        fullLexicon = {...AFINN_obj};
    }
    if (currentLexicons.includes('historical')) {
        fullLexicon = {...fullLexicon,  ...historicalLexiconObj};
    }
    // something about what to do about custom lexicons
    return fullLexicon;
}



function makeFullStopwordsList() {
    let fullStopwordsList = []
    if (currentStopwords.includes('ntlk')) {
        fullStopwordsList = fullStopwordsList.concat(ntlkStopwordsList);
    }
    if (currentStopwords.includes('tool')) {
        fullStopwordsList = fullStopwordsList.concat(toolStopwordsList);
    }
    // something about what to do about custom stopwords lists
    return fullStopwordsList;
}

function removeStopWords(tokens, stopwordsList) {
    let filteredTokens = tokens.filter((token) => !stopwordsList.includes(token))
    return filteredTokens
}



function scoreText(tokens, lexicon) {
    let terms = Object.keys(lexicon);
    let textScore = 0;
    let scoredWords = {};

    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (terms.includes(token)) {
            let score = lexicon[token];
            let priorToken = tokens[i-1];

            if (priorToken == "not") { // makes score negative if word is preceded by "not"
                score = score * -1;
                token = "not " + token;
            } else { // ensures score is a number not a string
                score = score * 1
            }

            textScore = textScore + score;
            scoredWords[token] = score;
        }
    }
    appendResultsToVerdictSection(textScore, scoredWords);
}


function appendResultsToVerdictSection(textScore, scoredWords) {
    let verdictSection = id("result");
    let terms = Object.keys(scoredWords);
    verdictSection.textContent = ''; // reset the verdict section so we don't just keep adding paragraphs to it

    if (terms.length > 0) {
        appendTextElementToSection("p", verdictSection, "The overall score for this text was " + textScore + ".");
        appendTextElementToSection("p", verdictSection, "The terms and their scores were:");

        let scoredWordsList = gen("ul");
        scoredWordsList.id = "scoredWordsList";

        terms.forEach((word) => {
            let sentence = word + ": " + scoredWords[word];
            appendTextElementToSection("li", scoredWordsList, sentence)
        })

        verdictSection.appendChild(scoredWordsList);
    } else {
        appendTextElementToSection("p", verdictSection, "No words of the inputted text matched any terms in the currently selected lexicon(s), and thus, no words have been scored.");
    }
}

function appendTextElementToSection(element, parentElement, text) {
    let e = gen(element);
    e.textContent = text;
    parentElement.append(e);
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