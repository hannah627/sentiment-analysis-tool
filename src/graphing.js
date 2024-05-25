import { id, gen } from './utils.js';
// import { playGraph } from './sonification.js';

export function graphTokenScores(location, scoredWords, fileName) {

    let graph = gen("div");
    graph.classList.add("scoredTokensGraph");
    graph.id = fileName + "scoredTokensGraph";
    graph.role = "img";

    let scoresCounts = {};
    for (let i = 0; i < scoredWords.length; i++) {
        let score = scoredWords[i].score;
        if (score in scoresCounts) {
            scoresCounts[score] = scoresCounts[score] + 1; // increases count for the score
        } else {
            scoresCounts[score] = 1; // creates new entry to start tracking that score
        }
    };

    let trace = {
        x: Object.keys(scoresCounts),
        y: Object.values(scoresCounts),
        type: 'bar',
        text: Object.values(scoresCounts).map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        // hoverinfo: Object.values(scoresCounts),
        marker: {
            color: '#193819' // changes bar color to dark green
        }
    };
    let data = [trace];

    let layout = {
        width: 600,
        height: 400,
        bargap: 0.05,
        barmode: 'stack',
        title: "Distribution of Scores",
        xaxis: {
            title: "Score",
            range: [-6.5, 6.5],
            tickmode: "array",
            tickvals: [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], // might want to not hard code this
            ticktext: ['-6', '-5', '-4', '-3', '-2', '-1', '+1', '+2', '+3', '+4', '+5', '+6']
            // looks like we might be able to use rangeselector and/or rangeslider?
        },
        yaxis: {title: "Number of Words"},
        paper_bgcolor: '#F7FBDA',
        plot_bgcolor: '#F7FBDA'
    }

    Plotly.newPlot(graph, data, layout);

    let minMaxText = createMaxMinDescriptionOfScoresGraphs(scoresCounts);

    graph.ariaLabel = "Graph. A bar plot of the count of various scores in the document. Score is on the x-axis, from negative 6 to 6, and count is on the y-axis. There are " + Object.keys(scoresCounts).length + " bars. " + minMaxText;


    let graphContainer = createGraphContainer("tokenScore", fileName, Object.keys(scoresCounts), Object.values(scoresCounts));
    graphContainer.appendChild(graph);

    let tableView = createTableVerOfTokenGraph(scoresCounts);
    tableView.id = fileName + "scoredTokensTable";
    graphContainer.appendChild(tableView);

    location.appendChild(graphContainer);
}






export function graphDocumentScores(documentScores, location) {
    let graph = gen("div");
    graph.id = "corpusScoresGraph";
    graph.role = "img";

    let xPoints = [];
    let yPoints = [];
    let labelsList = [];

    let byXVals = [];
    let byYVals = [];

    for (let i = 0; i < documentScores.length; i++) {
        let documentInfo = documentScores[i];
        xPoints.push(parseFloat(documentInfo.score));
        yPoints.push(parseFloat(documentInfo.percentTokensScored));
        labelsList.push(documentInfo.file);

        byXVals.push({"score": parseFloat(documentInfo.score), "file": documentInfo.file})
        byYVals.push({ "percent": parseFloat(documentInfo.percentTokensScored), "file": documentInfo.file })
    }

    var data = [
        {
            x: xPoints,
            y: yPoints,
            mode: 'markers',
            ids: labelsList,
            marker: {
                size: 16,
                color: '#193819',
            },
            text: labelsList,
            type: 'scatter',
            hovertemplate: '<b><i>%{text}</i></b>' +
                            '<br>Document Score: %{x}<br>' +
                            'Percent of Tokens Scored: %{y}% <extra></extra>' // <extra></extra> removes weird "trace0" label
        }
    ];

    let layout = {
        title: "Distribution of Document Scores",
        width: 600,
        height: 400,
        xaxis: {
            title: "Score",
            range: [-1.25, 1.25],
            tickvals: [-1, -0.5, 0, 0.5, 1], // might want to not hard code this
            ticktext: ['-1', '-0.5', '0', '+0.5', '+1']
        },
        yaxis: {
            title: "Percent of Words in File Scored",
            range: [0, (Math.max(...yPoints) + 1)]
        },
        paper_bgcolor: '#F7FBDA',
        // would be nice if we could change this to have multiple colors as it goes along, like positive vs. negative 
        plot_bgcolor: '#F7FBDA'
    }

    Plotly.newPlot(graph, data, layout);


    let maxX = Math.max(...xPoints);
    let maxY = Math.max(...yPoints);
    let minX = Math.min(...xPoints);
    let minY = Math.min(...yPoints);

    let docWithMaxX = byXVals.find(item => item.score == maxX).file;
    let docWithMaxY = byYVals.find(item => item.percent == maxY).file;
    let docWithMinX = byXVals.find(item => item.score == minX).file;
    let docWithMinY = byYVals.find(item => item.percent == minY).file;

    let maxPointText = createExtremeValueDescriptionOfCorpusOverview("highest", docWithMaxX, docWithMaxY, maxX, maxY);
    let minPointText = createExtremeValueDescriptionOfCorpusOverview("lowest", docWithMinX, docWithMinY, minX, minY);

    graph.ariaLabel = "Graph. A scatterplot of document scores by the percentage of terms in the file that were scored. Score is on the x-axis, from negative 1 to 1, and percentage terms scored is on the y-axis, from 0 to " + String(Math.max(...yPoints) + 1) + ". " + maxPointText + " " +  minPointText;


    let graphContainer = createGraphContainer("documentScore", "documentScore", xPoints, yPoints);
    graphContainer.appendChild(graph);

    let tableView = createTableVerOfDocumentScoresGraph(documentScores);
    tableView.id = "corpusScoresTable";
    graphContainer.appendChild(tableView);

    location.prepend(graphContainer); // need to add graph to site before we can query select for points
}





function createGraphContainer(type, nameForID, xData, yData) {
    let graphContainer = gen("div");
    graphContainer.classList.add("graphContainer");
    graphContainer.id = nameForID + "_graphContainer";

    let graphOptionsContainer = gen("div");
    graphOptionsContainer.classList.add("graphOptionsContainer");
    let graphTitle = ""; // need it to exist before the if/else, but don't know what it should be until if/else

    if (type == "documentScore") {
        graphTitle = gen("h3");
        graphTitle.textContent = "Distribution of Document Scores";
    } else {
        graphTitle = gen("h4");
        graphTitle.textContent = "Distribution of Scores";
    }
    graphOptionsContainer.appendChild(graphTitle);

    let graphOptionsButtonsContainer = gen("div");
    graphOptionsButtonsContainer.classList.add("graphOptionsButtonsContainer");

    let graphButton = gen("button");
    graphButton.textContent = "View as Graph";
    graphButton.id = nameForID + "_viewGraphBtn";
    graphButton.addEventListener("click", (e) => { graphButtonClick(e, type) })
    graphOptionsButtonsContainer.appendChild(graphButton);


    let tableButton = gen("button");
    tableButton.textContent = "View as Table";
    tableButton.id = nameForID + "_viewTableBtn";
    tableButton.addEventListener("click", (e) => { tableButtonClick(e, type) })
    graphOptionsButtonsContainer.appendChild(tableButton);


    // code to do with sonification - lacked time to finish
    // let playButton = gen("button");
    // playButton.textContent = "Hear Graph";
    // playButton.id = nameForID + "_playGraph";

    // function playNote() {
    //     const synth = new Tone.Synth().toDestination();
    //     synth.triggerAttackRelease("C4", "8n"); // play a note from that synth - 8n = 8th note
    // }
    // playButton.addEventListener("click", playNote);

    // async function playGraph() {
    //     await Tone.start()
    //     console.log("audio is ready")
    //     // const synth = new Tone.Synth().toDestination();
    //     const osc = new Tone.Oscillator().toDestination();
    //     osc.frequency.value = "C4"; // start at "C4"
    //     osc.frequency.rampTo("C2", 2); // ramp to "C2" over 2 seconds
    //     osc.start().stop("+3"); // start the oscillator for 2 seconds
    // }
    // playButton.addEventListener("click", async() => { await playGraph(xData, yData) })


    // graphOptionsButtonsContainer.appendChild(playButton);

    graphOptionsContainer.appendChild(graphOptionsButtonsContainer);
    graphContainer.appendChild(graphOptionsContainer);

    return graphContainer;
}




function graphButtonClick(e, type) { // when user clicks "View as Graph"
    if (type == "documentScore") {  // there is only one document scores graph
        if (id("corpusScoresGraph").style.display == "none") { // if graph view is hidden, display it
            id("corpusScoresGraph").style.display = "flex";
            id("corpusScoresTable").style.display = "none";
        }
    } else { // if we're clicking a tokenScore graph, need to deal with finding unknown ID
        let fileName = e.target.id.substring(0, e.target.id.length - 13); // removing '_viewGraphBtn'
        if (id(fileName + "scoredTokensGraph").style.display == "none") {
            id(fileName + "scoredTokensGraph").style.display = "flex";
            id(fileName + "scoredTokensTable").style.display = "none";
        }
    }
}

function tableButtonClick(e, type) { // when user clicks "View as Table"
    if (type == "documentScore") { // there is only one document scores graph
        if (id("corpusScoresGraph").style.display != "none") { // if graph view is visible, hide it
            id("corpusScoresGraph").style.display = "none";
            id("corpusScoresTable").style.display = "flex";
        }
    } else {
        let fileName = e.target.id.substring(0, e.target.id.length - 13); // removing '_viewTableBtn'
        if (id(fileName + "scoredTokensGraph").style.display != "none") {
            id(fileName + "scoredTokensGraph").style.display = "none";
            id(fileName + "scoredTokensTable").style.display = "flex";
        }
    }
}





function createTableVerOfTokenGraph(scoresCounts) {
    let tableView = gen("div");
    let table = createTableWithHeadings(["Score", "Number of Words With That Score"]);

    let tableBody = gen("tbody");

    let sortedKeys = Object.keys(scoresCounts).sort((a, b) => {return a - b})

    for (let i = 0; i < sortedKeys.length; i++) {
        let rowContainer = gen("tr");
        let score = sortedKeys[i];
        let count = scoresCounts[score];

        let scoreCell = gen("td");
        scoreCell.textContent = score;
        rowContainer.appendChild(scoreCell);

        let countCell = gen("td");
        countCell.textContent = count;
        rowContainer.appendChild(countCell)

        tableBody.appendChild(rowContainer);
    }

    table.appendChild(tableBody);
    tableView.appendChild(table);
    tableView.classList.add("tableContainer");
    tableView.style.display = "none";
    return tableView;
}


function createTableVerOfDocumentScoresGraph(documentScores) {
    let tableView = gen("div");
    let table = createTableWithHeadings(["Document", "Score", "Percentage of Tokens Scored"]);

    let tableBody = gen("tbody");
    for (let i = 0; i < documentScores.length; i++) {
        let rowContainer = gen("tr");
        let data = documentScores[i];

        let docCell = gen("td");
        docCell.textContent = data.file;
        rowContainer.appendChild(docCell);

        let scoreCell = gen("td");
        scoreCell.textContent = data.percentTokensScored;
        rowContainer.appendChild(scoreCell);

        let countCell = gen("td");
        countCell.textContent = data.score;
        rowContainer.appendChild(countCell);

        tableBody.appendChild(rowContainer);
    }
    table.appendChild(tableBody);

    tableView.appendChild(table);
    tableView.classList.add("tableContainer");
    tableView.style.display = "none";
    return tableView;
}


function createTableWithHeadings(listOfHeadings) {
    let table = gen("table");
    let tableHeading = gen("thead");
    let tableHeadingRow = gen("tr");

    for (let i = 0; i < listOfHeadings.length; i++) {
        let headingCell = gen("th");
        headingCell.textContent = listOfHeadings[i];
        tableHeadingRow.appendChild(headingCell)
    }

    tableHeading.appendChild(tableHeadingRow);
    table.appendChild(tableHeading);

    return table;
}




function createExtremeValueDescriptionOfCorpusOverview (descriptor, extremeXLabel, extremeYLabel, extremeX, extremeY) {
    // for describing the maximum and minimum scores and percent tokens scored, along with corresponding documents, for the corpus overview graph - text is used in ARIA label, which is read out to screen readers to make graphs more accessible for non-sighted users
    // descriptor is "highest" or "lowest", in accordance with if it's describing the maximum or minimum value
    let text = "";

    if (extremeXLabel == extremeYLabel) {
        text = "The document with the " + descriptor + " score is the same as the one with the " + descriptor + " percentage of tokens scored, which was " + extremeXLabel + ", with a score of " + extremeX + " and a percentage of tokens scored of " + extremeY + ".";
    } else {
        text = "The document with the " + descriptor + " score was " + extremeXLabel + ", with a score of " + extremeX + ". The document with the  " + descriptor + " percentage of tokens scored was " + extremeYLabel + ", with a percentage scored of " + extremeY + ".";
    }
    return text;
}


function createMaxMinDescriptionOfScoresGraphs(scoresCounts) {
    let highestCount = Math.max(...Object.values(scoresCounts));;
    let lowestCount = Math.min(...Object.values(scoresCounts));

    let highestCountLabels = [];
    let lowestCountLabels = [];

    for (let i = 0; i < Object.keys(scoresCounts).length; i++) {
        let currScore = Object.keys(scoresCounts)[i];
        let currCount = scoresCounts[currScore]
        if (currCount == highestCount) {
            highestCountLabels.push(currScore);
        } else if (currCount == lowestCount) {
            lowestCountLabels.push(currScore);
        }
    }

    let maxText = "";
    let minText = "";

    if (highestCountLabels.length == 1) {
        maxText = "The score with the highest count was " + highestCountLabels + ", with " + highestCount + " occurrences.";
    } else {
        maxText = "There were " + highestCountLabels.length + " scores that had the highest count, with " + highestCount + " occurrences. Those scores were " + highestCountLabels.join(', ') + ".";
    }

    if (lowestCountLabels.length == 1) {
        minText = "The score with the lowest count was " + lowestCountLabels + ", with " + lowestCount + " occurrences.";
    } else {
        minText = "There were " + lowestCountLabels.length + " scores that had the lowest count, with " + lowestCount + " occurrences. Those scores were " + lowestCountLabels.join(', ') + ".";
    }

    let text = [maxText, minText].join(' ')

    return text;
}