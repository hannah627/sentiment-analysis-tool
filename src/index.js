import {
    createFileResultsHeader,
    addRowsToTokenTable,
    createSummarySection,
    createTokenTableSection,
    createDropDownHeader
} from './creating_elements.js';


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

let totalFilesProcessed = 0;
let totalCorpusScore = 0;


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

    id("singleInputResultsSection").style.display = "none";
    id("multipleInputsResultsSection").style.display = "none";
    id("tableSection").style.display = "none";

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
        processFileLexicon(afinnLexicon, '\t', AFINN_obj, "AFINN English");
        processFileLexicon(historicalLexicon, ' ', historicalLexiconObj, "Historical Lexicon");
    });
}

function processFileLexicon(lexicon, separator, lexiconObj, lexiconName) {
    let lines = lexicon.split('\n');
    lines.forEach((line) => {
        let [word, score] = line.split(separator);

        // lexiconObj[word] = score;
        lexiconObj[word] = {
            "score": score,
            "lexicon": lexiconName
        };
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
    id("singleInputResultsSection").style.display = "block"; // unhide full text container
    let inputtedText = id("input").value;
    processSingleFileOrInputText(inputtedText);
}


function processInputtedFile(e) {
    tableSection.style.display = "none";
    clearResultsSection();
    totalFilesProcessed = 0;
    totalCorpusScore = 0;

    let files = e.currentTarget.files;
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();
        reader.onload = (function() {
            if (files.length == 1) {
                return function() { singleFileOnLoadHandler(this) }
            }
            else {
                return function() {
                    onLoadHandler(this, file, files.length);
                    onLoadEndHandler(files.length);
               };
            }
        })(file);
        reader.readAsText(file);
    }
}


function singleFileOnLoadHandler(reader) {
    let file_text = reader.result;
    id("singleInputResultsSection").style.display = "block";
    id("multipleInputsResultsSection").style.display = "none";
    processSingleFileOrInputText(file_text)

    id("singleInputResultsSection").scrollIntoView({behavior: 'smooth'});
}


function onLoadHandler(reader, file) {
    let file_text = reader.result;
    id("singleInputResultsSection").style.display = "none";
    id("multipleInputsResultsSection").style.display = "block";
    let score = processOneOfMultipleFiles(file.name, file_text);
    totalCorpusScore = totalCorpusScore + score;
}


function onLoadEndHandler(numFiles) {
    totalFilesProcessed++;
    if (totalFilesProcessed == numFiles) { // need to do this b/c need to wait for all files to be processed for corpus score
        let resultsSection = id("multipleFilesResults");

        let summaryText = gen("p");
        summaryText.textContent = "The results for all files is shown below:"
        resultsSection.prepend(summaryText);

        let corpusResultsText = gen("p");
        corpusResultsText.textContent = "Overall corpus score: " + (totalCorpusScore / numFiles).toFixed(3);
        resultsSection.prepend(corpusResultsText);
        id("multipleInputsResultsSection").scrollIntoView({behavior: 'smooth'});
    };
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

    // add rows to table up here, b/c table needs to be in the DOM to find it by ID, so sections need to be appended
    addRowsToTokenTable(scoredWords, fileName + "TokenTable");

    return (textScore / totalNumTokens);
}


// create and pass a file dictionary {}?
function createFileResultsSection(fileName, textScore, totalNumTokens, text, scoredWords) {
    let resultsHeader = createFileResultsHeader(fileName, textScore, totalNumTokens);

    let resultsContainer = gen("section"); // make this contain two more dropdowns? one for full text, one for seeing score tokens?
    resultsContainer.classList.add("fileResultsContainer");
    resultsContainer.id = fileName + "ResultsContainer";
    resultsContainer.style.display = "none"; // file results hidden by default

    // do the tables for each file
    let summarySection = createSummarySection(textScore, totalNumTokens, scoredWords.length)
    resultsContainer.appendChild(summarySection);

    let tokenTableSection = createTokenTableSection(fileName);
    resultsContainer.appendChild(tokenTableSection);

    // do the dropwdown for full text
    let fullTextDropDownHeader = createDropDownHeader('Full Text', fileName + "FullText");
    let fullTextContainer = createFullTextDropdown(fileName, text, scoredWords);

    resultsContainer.appendChild(fullTextDropDownHeader);
    resultsContainer.appendChild(fullTextContainer);

    fullTextDropDownHeader.addEventListener("click", () => {
        toggleDropDownSectionVisibility(fileName + "FullTextContainer",
                                        fileName + "FullTextHeader",
                                        fileName + "FullTextArrow", "block") });

    resultsHeader.addEventListener("click", () => {
        toggleDropDownSectionVisibility(fileName + "ResultsContainer", fileName + "ResultsHeader", fileName + "Arrow", "block") });

    return [resultsHeader, resultsContainer];
}


 function createFullTextDropdown(nameForID, text, scoredWords) {
    let fullTextContainer = gen("section");
    fullTextContainer.id = nameForID + "FullTextContainer";
    returnFullText(text, fullTextContainer, scoredWords);
    fullTextContainer.style.display = "none";

    return fullTextContainer
}






function processText(text) {
    let formatted_text = lowerCaseAndRemovePunctuationOfText(text);
    let tokens = tokenizeText(formatted_text);
    let totalNumTokens = tokens.length;

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
            let score = lexicon[token].score;
            let lexiconName = lexicon[token].lexicon;
            let priorToken = tokens[i-1];

            if (priorToken == "not") { // makes score negative if word is preceded by "not"
                score = score * -1;
                token = "not " + token;
            } else { // ensures score is a number not a string
                score = score * 1
            }

            textScore = textScore + score;
            scoredWords.push({"token": token, "score": score, "lexicon": lexiconName});
        }
    }
    return [textScore, scoredWords];
}



function appendResultsToVerdictSection(textScore, scoredWords, totalNumTokens) {
    let verdictSection = id("verdict");
    let summaryTableContainer = id("singleInputSummaryTableContainer");

    let tableSection = id("tableSection");

        // if scoredWords.length > 10 (or something), then put table into dropdown?

    if (scoredWords.length > 0) {
        verdictSection.style.display = "none";
        summaryTableContainer.style.display = "flex";

        // fill our the cells in the summary table
        id("compScoreCell").textContent = (textScore / totalNumTokens).toFixed(3);
        id("totalScoreCell").textContent = textScore;
        id("scoredTokensCell").textContent = scoredWords.length;
        id("totalTokensCell").textContent = totalNumTokens;

        // find positive and negative words, and create rows for them in the tokens table
        addRowsToTokenTable(scoredWords, 'scoresTable');
        tableSection.style.display = "flex";

    } else {
        tableSection.style.display = "none";
        summaryTableContainer.style.display = "none";

        verdictSection.textContent = '';
        verdictSection.style.display = "block";
        appendTextElementToSection("p", verdictSection, "No words of the inputted text matched any terms in the currently selected lexicon(s), and thus, no words have been scored.");
    }
}


function appendTextElementToSection(element, parentElement, text) {
    let e = gen(element);
    e.innerHTML = text;
    parentElement.append(e);
}



function returnFullText(text, textSection, scoredWords) {
    let textSectionContent = [];
    let fullTextTokens = tokenizeText(text);

    let copyScoredWords = [...scoredWords]; // use copy of scoredWords, b/c we delete from it

    for (let i = 0; i < fullTextTokens.length; i++) {
        let currentWord = fullTextTokens[i];
        let toAppend = currentWord;
        let currentWordToken = lowerCaseAndRemovePunctuationOfText(currentWord);

        if (copyScoredWords.length > 0) { // check b/c if we don't have any more words with scores, no point doing this
            let currentToken = copyScoredWords[0].token;

            if (currentToken.split(' ')[0] == "not") { // if token was 2 words, and the first is "not"
                currentWordToken = "not " + currentWordToken;

                if (currentWordToken == currentToken) {
                    textSectionContent.pop(); // remove the last part of the textSectionContent array so that "not" isn't there twice
                    copyScoredWords.splice(0, 1); // remove current token from scoredWords list, so it goes faster

                    currentWord = fullTextTokens[i - 1] + " " + currentWord;
                    let score = copyScoredWords[0].score;
                    toAppend = "<span class='scoredWord'>" + currentWord + "<span class='toolTipText'> Score: " + score + "</span></span>";
                }

            } else if (currentWordToken == currentToken) {
                let score = copyScoredWords[0].score;
                toAppend = "<span class='scoredWord'>" + currentWord + "<span class='toolTipText'> Score: " + score + "</span></span>";
                copyScoredWords.splice(0, 1); // remove current token from scoredWords list, so it goes faster
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
export function id(idName) {
    return document.getElementById(idName);
}

/**
 * a helper function to make creating an element easier and faster
 * @param {string} tagName - the name of the element to create
 * @returns {Element} of type tagName
 */
export function gen(tagName) {
    return document.createElement(tagName);
}