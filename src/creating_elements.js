import {id, gen} from './index.js'


export function createFileResultsHeader(fileName, textScore, totalNumTokens) {
    let resultsHeader = gen("section");
    resultsHeader.id = fileName + "ResultsHeader";
    resultsHeader.classList.add("fileResultsHeader");

    let fileTitle = gen("h4");
    fileTitle.textContent = fileName;

    let score = gen("h4");
    score.textContent = (textScore / totalNumTokens).toFixed(3);

    let button = createArrowButton(fileName + "Arrow");

    let scoreAndButtonContainer = gen("div");
    scoreAndButtonContainer.classList.add("scoreAndButtonContainer");

    scoreAndButtonContainer.appendChild(score);
    scoreAndButtonContainer.appendChild(button);

    resultsHeader.appendChild(fileTitle);
    resultsHeader.appendChild(scoreAndButtonContainer);

    return resultsHeader;
}


function createArrowButton(idForArrow) {
    let arrow = gen("i");
    arrow.classList.add("arrow");
    arrow.classList.add("down");
    arrow.id = idForArrow;

    let button = gen("button");
    button.classList.add("arrowButton");
    button.appendChild(arrow);
    return button;
}



// SUMMARY TABLES
export function createSummarySection(textScore, totalNumTokens, numScoredTokens) {
    let summarySection = gen("section");

    let summarySectionHeading = gen("h3");
    summarySectionHeading.textContent = "Summary";
    summarySection.appendChild(summarySectionHeading);

    let summaryTableContainer = createSummaryTable(textScore, totalNumTokens, numScoredTokens);
    summarySection.appendChild(summaryTableContainer);

    return summarySection
}


function createSummaryTable(textScore, totalNumTokens, numScoredTokens) {
    let container = gen("div");
    container.classList.add("tableContainer");
    container.classList.add("summaryTableContainer");

    let table = gen("table");
    let colgroup = gen("colgroup");
    colgroup.span = "2";
    table.appendChild(colgroup);
    table.appendChild(colgroup.cloneNode(true));

    let thead = gen("thead");
    let superHeaderRow = gen("tr");
    let scoreSuperHeader = gen("th");
    scoreSuperHeader.colSpan = "2";
    scoreSuperHeader.scope = "colgroup";
    scoreSuperHeader.classList.add("superColumnHeader");
    scoreSuperHeader.textContent = "Scores";

    let tokenSuperHeader = gen("th");
    tokenSuperHeader.colSpan = "2";
    tokenSuperHeader.scope = "colgroup";
    tokenSuperHeader.classList.add("superColumnHeader");
    tokenSuperHeader.textContent = "Tokens";

    superHeaderRow.appendChild(scoreSuperHeader);
    superHeaderRow.appendChild(tokenSuperHeader);
    thead.appendChild(superHeaderRow);


    let headerRow = gen("tr");

    let compScoreHeader = gen("th");
    compScoreHeader.scope = "col";
    compScoreHeader.innerHTML = "<span class='toolTip'>Comparative Score<span class='toolTipText'>The Total Score divided by the number of words</span></span>";

    let totalScoreHeader = gen("th");
    totalScoreHeader.scope = "col";
    totalScoreHeader.innerHTML = "<span class='toolTip'>Total Score<span class='toolTipText'>The sum of the scores of all scored tokens</span></span>";

    let scoredTokensHeader = gen("th");
    scoredTokensHeader.scope = "col";
    scoredTokensHeader.textContent = "Scored Tokens";

    let totalTokensHeader = gen("th");
    totalTokensHeader.scope = "col";
    totalTokensHeader.textContent = "Total Tokens";

    headerRow.appendChild(compScoreHeader);
    headerRow.appendChild(totalScoreHeader);
    headerRow.appendChild(scoredTokensHeader);
    headerRow.appendChild(totalTokensHeader);

    thead.appendChild(headerRow);
    table.appendChild(thead);


    let tbody = gen("tbody");
    let bodyRow = gen("tr");

    let compScoreCell = gen("td");
    compScoreCell.textContent = (textScore / totalNumTokens).toFixed(3);
    bodyRow.appendChild(compScoreCell);

    let totalScoreCell = gen("td");
    totalScoreCell.textContent = textScore;
    bodyRow.appendChild(totalScoreCell);

    let scoredTokensCell = gen("td");
    scoredTokensCell.textContent = numScoredTokens;
    bodyRow.appendChild(scoredTokensCell);

    let totalTokensCell = gen("td");
    totalTokensCell.textContent = totalNumTokens;
    bodyRow.appendChild(totalTokensCell);

    tbody.appendChild(bodyRow);
    table.appendChild(tbody);

    container.appendChild(table);
    return container;
}





// TOKEN TABLES

export function addRowsToTokenTable(positiveWords, negativeWords, tableID) {
    let table = id(tableID);
    let tbody = table.lastElementChild;
    tbody.innerHTML = '';

    let numRows = Math.max(positiveWords.length, negativeWords.length);
    for (let i = 0; i < numRows; i++) {
        let rowContainer = gen("tr");

        if (positiveWords[i] != null) {
            createTokenTableCells(positiveWords[i][0], positiveWords[i][1], '', rowContainer)
        } else {
            createTokenTableCells('', '', '', rowContainer)
        }

        if (negativeWords[i] != null) {
            createTokenTableCells(negativeWords[i][0], negativeWords[i][1], '', rowContainer)
        } else {
            createTokenTableCells('', '', '', rowContainer)
        }

        tbody.appendChild(rowContainer);
    }
    table.appendChild(tbody);
}

function createTokenTableCells(term, score, lexicon, row) {
    let termCell = gen("td");
    termCell.textContent = term;
    row.appendChild(termCell);

    let scoreCell = gen("td");
    scoreCell.textContent = score;
    row.appendChild(scoreCell);

    let lexiconCell = gen("td");
    lexiconCell.textContent = lexicon;
    row.appendChild(lexiconCell);
}



// FULL TEXT SECTIONS
export function createDropDownHeader(headerText, nameForID) {
    let header = gen("section");
    header.classList.add("dropDownHeader");
    header.id = nameForID + "Header";

    let title = gen("h3");
    title.textContent = headerText;
    header.appendChild(title);

    let arrow = createArrowButton(nameForID + "Arrow");
    header.appendChild(arrow);

    return header
}