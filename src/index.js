import {
    createFileResultsHeader,
    addRowsToTokenTable,
    createSummarySection,
    createTokenTableSection,
    createDropDownHeader
} from './creating_elements.js';

import { graphTokenScores, graphDocumentScores } from './graphing.js';

import { id, gen, toggleElementVisibility, toggleDropDownSectionVisibility } from './utils.js'


const AFINN_LINK = "lexicons/afinn-lexicon-en-165.txt";
const HISTORICAL_LINK = "lexicons/lexicon-v1.txt";

const NLTK_STOPWORDS_LINK = "stop_words_lists/nltk_stop_words.txt";
const TOOL_STOPWORDS_LINK = "stop_words_lists/tool_stop_words.txt";


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
let documentScores = [];


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

    id("customLexiconFileInput").addEventListener("change", (e) => { customLexiconFileInput(e) });

    id("input").addEventListener("input", processInputtedText);
    id("inputFile").addEventListener("change", (e) => { processInputtedTextFile(e) });

    // finding lexicon option checkboxes and adding event listeners to them
    let lexiconOptions = document.querySelectorAll('input[name=lexicon]');
    lexiconOptions.forEach((e) => e.addEventListener("change", updateSelectedLexicons));

    let stopwordsOptions = document.querySelectorAll('input[name=stopwords]');
    stopwordsOptions.forEach((e) => e.addEventListener("change", updateSelectedStopwords));

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



function customLexiconFileInput(e) {
    let file = e.currentTarget.files[0];
    let reader = new FileReader();

    reader.onload = (function(e) {
        let text = e.target.result;
        processLexiconCSV(text, customLexiconObj);
    });
    reader.readAsText(file);
}

function processLexiconCSV(text, resultsObj) {
    let lines = text.split('\n');
    lines.forEach(line => {
        let columns = line.split(',');
        let token = columns[0];
        let score = columns[1];
        resultsObj[token] = {
            "score": score,
            "lexicon": "Custom"
        }
    });
}










function processInputtedText() {
    id("singleInputResultsSection").style.display = "block"; // unhide full text container
    let inputtedText = id("input").value;
    processSingleFileOrInputText(inputtedText);
}


function processInputtedTextFile(e) {
    tableSection.style.display = "none";
    clearResultsSection();
    totalFilesProcessed = 0;
    totalCorpusScore = 0;

    let files = e.currentTarget.files;
    let userContinuing = true;

    // limit the maximum number of files that will be processed, or at least give a warning about bad performance
    if (files.length > 100) {
        userContinuing = window.confirm("Uploading a lot of files may decrease performance/make the tool run slower. You might want to try again and upload less files, or you can keep going, but be aware that it may take longer than usual to finish. Would you like to continue?");
    }

    if (userContinuing) {
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();
            reader.onload = (function() {
                if (files.length == 1) {
                    return function() { singleFileOnLoadHandler(this) }
                }
                else {
                    return function() {
                        onLoadHandler(this, file);
                        onLoadEndHandler(files.length);
                   };
                }
            })(file);
            reader.readAsText(file);
        }
    } else { // user received warning about number of uploaded files and clicked "cancel"
        e.currentTarget.value = '';
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
    let documentObj = processOneOfMultipleFiles(file.name, file_text);
    documentScores.push(documentObj); // push to global list of objs
    totalCorpusScore = totalCorpusScore + (documentObj.score * 1); // needs to be mult. by 1 to see it as a number
}


function onLoadEndHandler(numFiles) {
    totalFilesProcessed++;
    if (totalFilesProcessed == numFiles) { // need to do this b/c need to wait for all files to be processed for corpus score
        let resultsSection = id("multipleFilesResults");

        let summaryText = gen("p");
        summaryText.textContent = "The results for all files are shown below:"
        resultsSection.prepend(summaryText);

        graphDocumentScores(documentScores, resultsSection);

        let corpusResultsSection = gen("section");
        corpusResultsSection.classList.add("subSection");
        corpusResultsSection.classList.add("centerText");
        let corpusResultsText = gen("h3");
        let toolTip = "<span class='toolTip'>Corpus Score<span class='toolTipText'>The average of each document's comparative score</span></span>";
        corpusResultsText.innerHTML = "Overall " + toolTip + ": " + (totalCorpusScore / numFiles).toFixed(3);
        corpusResultsSection.appendChild(corpusResultsText);
        resultsSection.prepend(corpusResultsSection);

        id("multipleInputsResultsSection").scrollIntoView({behavior: 'smooth'});
    };
}




function clearResultsSection () {
    id("verdict").innerHTML = "";
    id("textResult").innerHTML = "";
    id("multipleFilesResults").innerHTML = "";
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

    let percentTokensScored = ((scoredWords.length / totalNumTokens) * 100).toFixed(3);
    let score = (textScore / totalNumTokens).toFixed(3);
    let documentObj = {"file": fileName, "score": score, "percentTokensScored": percentTokensScored};

    return documentObj;
}


// create and pass a file dictionary {}?
function createFileResultsSection(fileName, textScore, totalNumTokens, text, scoredWords) {
    let resultsHeader = createFileResultsHeader(fileName, textScore, totalNumTokens);

    let resultsContainer = gen("section");
    resultsContainer.classList.add("fileResultsContainer");
    resultsContainer.id = fileName + "ResultsContainer";
    resultsContainer.style.display = "none"; // file results hidden by default

    // do the tables for each file
    let summarySection = createSummarySection(textScore, totalNumTokens, scoredWords.length)
    resultsContainer.appendChild(summarySection);

    let tokenTableSection = createTokenTableSection(fileName, scoredWords);
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

    return fullTextContainer;
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

function makeFullLexicon() {
    let fullLexicon = {};
    if (currentLexicons.includes('AFINN_en')) {
        fullLexicon = {...AFINN_obj};
    }
    if (currentLexicons.includes('historical')) {
        // this does overwrite the score in the afinn lexicon, if the same word appears in both
        fullLexicon = {...fullLexicon,  ...historicalLexiconObj};
    }
    if (currentLexicons.includes('custom')) {
        fullLexicon = {...fullLexicon, ...customLexiconObj}
    }
    return fullLexicon;
}



function updateSelectedStopwords() {
    let checkedBoxes = document.querySelectorAll('input[name=stopwords]:checked');
    let selectedStopwords = [];
    checkedBoxes.forEach((e) => selectedStopwords.push(e.value));

    currentStopwords = selectedStopwords;
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
    let filteredTokens = tokens.filter((token) => !stopwordsList.includes(token));
    return filteredTokens;
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

    let graphContainer = id("singleInputTokensGraphContainer");
    let tableSection = id("tableSection");

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

        graphContainer.innerHTML = ""; // deletes the existing graph, if there is one
        graphTokenScores(graphContainer, scoredWords);
        graphContainer.style.display = "flex";

    } else {
        graphContainer.style.display = "none";
        graphContainer.innerHTML = ""; // deletes the existing graph, if there is one
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
                    if (fullTextTokens[i - 1] == "not") { // need to check b/c sometimes currentToken = "not pay" but text = "not to pay"
                        textSectionContent.pop(); // remove the last part of the textSectionContent array so that "not" isn't there twice
                        currentWord = "not " + currentWord;

                    } else if ((fullTextTokens[i - 2] == "not") && (fullTextTokens[i - 1] == "to")) {
                        textSectionContent.pop();
                        textSectionContent.pop(); // do twice to remove "not" and "to" from textSectionContent, so they don't appear twice
                        currentWord = "not to " + currentWord;

                    } else {
                        // this means there were likely multiple words cut from between "not" and second term (i.e. stop words), and so "not" shouldn't actually be affecting that second term
                        let oldScore = copyScoredWords[0].score;
                        copyScoredWords[0].score = -1 * oldScore; // undoing the sign change that "not" gives to scores
                    }

                    toAppend = createScoredWordToolTip(currentWord, copyScoredWords[0]);
                    copyScoredWords.splice(0, 1); // remove current token from scoredWords list, so it goes faster
                }

            } else if (currentWordToken == currentToken) {
                toAppend = createScoredWordToolTip(currentWord, copyScoredWords[0]);
                copyScoredWords.splice(0, 1); // remove current token from scoredWords list, so it goes faster
            }
        }
        textSectionContent.push(toAppend); // regardless of if word has score or not, we need to add it to the full text
    }
    textSection.innerHTML = textSectionContent.join(' ');
}

function createScoredWordToolTip(currentWord, entry) {
    let score = entry.score;
    let lexiconName = entry.lexicon;
    let toolTipText = "<div class='toolTipText'><p>Score: " + score + "</p><p>Lexicon: " + lexiconName + "</p></div>";
    let toAppend = "<span class='scoredWord'>" + currentWord + toolTipText + "</span>";
    return toAppend;
}