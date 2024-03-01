"use strict";

(function() {

const AFINN_LINK = "lexicons/afinn-lexicon-en-165.txt";
const HISTORICAL_LINK = "lexicons/lexicon-v1.txt";

const NLTK_STOPWORDS_LINK = "stop_words_lists/nltk_stop_words.txt";
const TOOL_STOPWORDS_LINK = "stop_words_lists/custom_stop_words.txt";

let AFINN_obj = {};
let historicalLexiconObj = {};
let customLexiconObj = {};

let nltkStopwordsList = [];
let toolStopwordsList = [];
let customStopwordsList = [];


let currentLexicons = ['AFINN_en', 'historical'];
let currentStopwords = ['nltk', 'tool'];


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
    id("singleInputResults").style.display = "none";
    id("tableContainer").style.display = "none";

    // adding general event listeners (options section button, main text input)
    id("optionsSectionHeader").addEventListener("click", () =>
        { toggleDropDownSectionVisibility("optionsSection", "optionsSectionHeader", "toggleOptionsSectionBtn", "flex") });
    id("input").addEventListener("input", processInputtedText);
    id("inputFile").addEventListener("change", (e) => { processInputtedFile(e) });

    // finding lexicon option checkboxes and adding event listeners to them
    let lexiconOptions = document.querySelectorAll('input[name=lexicon]');
    lexiconOptions.forEach((e) => e.addEventListener("change", updateSelectedLexicons));

    id("lexicon3").addEventListener("change", function() { toggleElementVisibility("customLexiconSection", "flex"); });
    id("stopwords3").addEventListener("change", function() { toggleElementVisibility("customStopwordsSection", "flex"); });

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
        fetch(NLTK_STOPWORDS_LINK).then(x => x.text()),
        fetch(TOOL_STOPWORDS_LINK).then(x => x.text())
    ]).then(([nltk_stopwords, tool_stopwords]) => {
        processFileStopwords(nltk_stopwords, nltkStopwordsList);
        processFileStopwords(tool_stopwords, toolStopwordsList);
    });
}

function processFileStopwords(list, resultList) {
    let terms = list.split('\n');
    terms.forEach((term) => {
        resultList.push(term);
    })
}



function toggleElementVisibility(elementID, displayType) {
    let element = id(elementID);
    if (element.style.display === "none") {
        element.style.display = displayType;
    } else {
        element.style.display = "none"
    }
}

function toggleDropDownSectionVisibility(sectionContentID, sectionHeaderID, arrowButtonID, displayType) {
    let sectionContent = id(sectionContentID);
    let sectionHeader = id(sectionHeaderID);
    let arrowButton = id(arrowButtonID);

    if (sectionContent.style.display === "none") {
        sectionContent.style.display = displayType;
        sectionHeader.style.borderRadius = "15px 15px 0px 0px";
        arrowButton.classList.remove('down');
        arrowButton.classList.add('up');

    } else {
        sectionContent.style.display = "none";
        sectionHeader.style.borderRadius = "15px";

        arrowButton.classList.remove('up');
        arrowButton.classList.add('down');
    }
}





function processInputtedText() {
    id("singleInputResults").style.display = "block"; // unhide full text container
    let inputtedText = id("input").value;
    processSingleFileOrInputText(inputtedText);
}

function processInputtedFile(e) {
    clearResultsSection();
    let files = e.currentTarget.files;
    Object.keys(files).forEach(i => {
        let file = files[i];
        let reader = new FileReader();
        reader.onload = () => {
            let file_text = reader.result;
            if (files.length == 1) {
                id("singleInputResults").style.display = "block";
                processSingleFileOrInputText(file_text)
            } else {
                id("singleInputResults").style.display = "none";
                processOneOfMultipleFiles(file.name, file_text);
            }
        }
        reader.readAsText(file);
    })
    if (files.length > 1) {
        console.log("we can add an extra function here to do sum and total results stuff");
        let resultsSection = id("multipleFilesResults");

        let summaryText = gen("p");
        summaryText.textContent = "The results for all files is shown below:"
        resultsSection.prepend(summaryText);
    }
}

function clearResultsSection () {
    id("verdict").innerHTML = "";
    id("textResult").innerHTML = "";
}


function processSingleFileOrInputText(text) {
    let [textScore, scoredWords, totalNumTokens] = processText(text);
    appendResultsToVerdictSection(textScore, scoredWords, totalNumTokens);

    let resultsSection = id("textResult");
    returnFullText(text, resultsSection, scoredWords);
}


function processOneOfMultipleFiles(fileName, fileText) {
    // this will be called multiple times, so we don't need to loop in here
    let [textScore, scoredWords, totalNumTokens] = processText(fileText);

    let [fileResultsHeader, fileResultsContainer] = createFileResultsSection(fileName, textScore, totalNumTokens, fileText, scoredWords);

    let resultsSection = id("multipleFilesResults");
    resultsSection.appendChild(fileResultsHeader);
    resultsSection.appendChild(fileResultsContainer);
}

// create and pass a file dictionary {}?
function createFileResultsSection(fileName, textScore, totalNumTokens, text, scoredWords) {
    let resultsHeader = gen("section");
    resultsHeader.id = fileName + "ResultsHeader";
    resultsHeader.classList.add("fileResultsHeader");

    let fileTitle = gen("h4");
    fileTitle.textContent = fileName;

    let score = gen("h4");
    score.textContent = (textScore / totalNumTokens).toFixed(3);

    let arrow = gen("i");
    arrow.classList.add("arrow");
    arrow.classList.add("down");
    arrow.id = fileName + "Arrow";

    let button = gen("button");
    button.classList.add("fileResultsButton");
    button.appendChild(arrow);

    let scoreAndButtonContainer = gen("div");
    scoreAndButtonContainer.classList.add("scoreAndButtonContainer");

    scoreAndButtonContainer.appendChild(score);
    scoreAndButtonContainer.appendChild(button);

    resultsHeader.appendChild(fileTitle);
    resultsHeader.appendChild(scoreAndButtonContainer);

    let resultsContainer = gen("section");
    resultsContainer.classList.add("fileResultsContainer");
    resultsContainer.id = fileName + "ResultsContainer";
    resultsContainer.style.display = "none";
    returnFullText(text, resultsContainer, scoredWords);

    resultsHeader.addEventListener("click", () => {
        toggleDropDownSectionVisibility(fileName + "ResultsContainer", fileName + "ResultsHeader", fileName + "Arrow", "block") });

    return [resultsHeader, resultsContainer];
}





function processText(text) {
    let formatted_text = lowerCaseAndRemovePunctuationOfText(text);
    let tokens = tokenizeText(formatted_text);
    let totalNumTokens = tokens.length; // for the verdict section

    let stopwordsList = makeFullStopwordsList();
    let filteredTokens = removeStopWords(tokens, stopwordsList);

    let lexicon = makeFullLexicon();
    let [textScore, scoredWords] = scoreText(filteredTokens, lexicon);
    return [textScore, scoredWords, totalNumTokens];
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
        fullLexicon = {...fullLexicon,  ...historicalLexiconObj}; // does this overwrite afinn entries? i hope so, but should test
    }
    // something about what to do about custom lexicons
    return fullLexicon;
}



function makeFullStopwordsList() {
    let fullStopwordsList = []
    if (currentStopwords.includes('nltk')) {
        fullStopwordsList = fullStopwordsList.concat(nltkStopwordsList);
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
    let scoredWords = [];

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
            scoredWords.push([token, score]);
        }
    }
    return [textScore, scoredWords];
}



function appendResultsToVerdictSection(textScore, scoredWords, totalNumTokens) {
    // doing this to prevent table from being destroyed if multiple inputs happen before refresh
    let resultsSection = id("resultsSection");
    let tableContainer = id("tableContainer");
    tableContainer.style.display = "none";
    resultsSection.appendChild(tableContainer);

    let verdictSection = id("verdict");
    verdictSection.textContent = ''; // reset the verdict section so we don't just keep adding paragraphs to it


    if (scoredWords.length > 0) {
        let totalExplanation = "<span class='toolTip'>Total Score:<span class='toolTipText'>The sum of the scores of all scored tokens</span></span>"
        let compExplanation = "<span class='toolTip'>Comparative Score:<span class='toolTipText'>The Total Score divided by the number of words</span></span>"

        appendTextElementToSection("p", verdictSection, totalExplanation + " " + textScore);
        appendTextElementToSection("p", verdictSection, compExplanation + " " + (textScore / totalNumTokens).toFixed(3));
        appendTextElementToSection("p", verdictSection, "The number of scored terms was " + scoredWords.length + ", out of a total of " + totalNumTokens + " tokens.");
        appendTextElementToSection("p", verdictSection, "The terms and their scores were:");

        let listContainer = gen("div");
        listContainer.id = "listContainer";

        let positiveWordsListContainer = makeScoresList("Positive");
        let positiveWordsList = positiveWordsListContainer.lastChild;

        let negativeWordsListContainer = makeScoresList("Negative");
        let negativeWordsList = negativeWordsListContainer.lastChild;

        scoredWords.forEach((entry) => { // adjust so it only displays each word once?
            let [token, score] = entry;
            let sentence = token + ": " + score;
            if (score > 0) {
                appendTextElementToSection("li", positiveWordsList, sentence);
            } else {
                appendTextElementToSection("li", negativeWordsList, sentence);
            }
        })
        listContainer.appendChild(positiveWordsListContainer);
        listContainer.appendChild(negativeWordsListContainer);

        verdictSection.appendChild(listContainer);

        verdictSection.appendChild(tableContainer);
        tableContainer.style.display = "flex";
    } else {
        appendTextElementToSection("p", verdictSection, "No words of the inputted text matched any terms in the currently selected lexicon(s), and thus, no words have been scored.");
    }
}


function appendTextElementToSection(element, parentElement, text) {
    let e = gen(element);
    e.innerHTML = text;
    parentElement.append(e);
}

function makeScoresList(type) {
    let WordsListContainer = gen("div");
    WordsListContainer.classList.add("wordsListContainer");

    let title = gen("h3");
    title.textContent = type + " Words:"
    WordsListContainer.appendChild(title);

    let WordsList = gen("ul");
    WordsList.id = type + "WordsList";
    WordsListContainer.appendChild(WordsList);

    return WordsListContainer;
}

function addRowsToTable(positiveWordsList, negativeWordsList, tableID) {
    let table = id(tableID)
    let numRows = Math.max(positiveWordsList.length, negativeWordsList.length);
    for (let i = 0; i < numRows; i++) {
        let rowContainer = gen("tr");
        console.log(positiveWordsList[i]);
        console.log(negativeWordsList[i]);
    }
}

function createTableCells() {
    // take positive or negative
    // create 3 table cells, with term score lexicon
}




function returnFullText(text, textSection, scoredWords) {
    let textSectionContent = [];
    let fullTextTokens = tokenizeText(text);

    for (let i = 0; i < fullTextTokens.length; i++) {
        let currentWord = fullTextTokens[i];
        let toAppend = currentWord;
        let currentWordToken = lowerCaseAndRemovePunctuationOfText(currentWord);

        if (scoredWords.length > 0) { // check b/c if we don't have any more words with scores, no point doing this
            let currentToken = scoredWords[0][0]; // get the first part of the first line in scoredWords (b/c format is "word, 5")

            if (currentToken.split(' ')[0] == "not") { // if token was 2 words, and the first is "not"
                currentWordToken = "not " + currentWordToken;

                if (currentWordToken == currentToken) {
                    textSectionContent.pop(); // remove the last part of the textSectionContent array so that "not" isn't there twice
                    scoredWords.splice(0, 1); // remove current token from scoredWords list, so it goes faster

                    currentWord = fullTextTokens[i - 1] + " " + currentWord;
                    let score = scoredWords[0][1];
                    toAppend = "<span class='scoredWord'>" + currentWord + "<span class='toolTipText'> Score: " + score + "</span></span>";
                }

            } else if (currentWordToken == currentToken) { // going to be an issue with this check, because not want != want
                let score = scoredWords[0][1];
                toAppend = "<span class='scoredWord'>" + currentWord + "<span class='toolTipText'> Score: " + score + "</span></span>";
                scoredWords.splice(0, 1); //should remove from scoredWords list; makes it faster?
            }
        }
        textSectionContent.push(toAppend);
    }
    textSection.innerHTML = textSectionContent.join(' ');
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