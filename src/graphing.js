import { id, gen } from './utils.js'

export function graphTokenScores(location, scoredWords, fileName) {

    let graphContainer = createGraphContainer("tokenScore", fileName);
    let graph = gen("div");
    graph.classList.add("scoredTokensGraph");
    graph.id = fileName + "scoredTokensGraph";

    let scoresCounts = {};
    for (let i = 0; i < scoredWords.length; i++) {
        let score = scoredWords[i].score;
        if (score in scoresCounts) {
            scoresCounts[score] = scoresCounts[score] + 1; // increases count for the score
        } else {
            scoresCounts[score] = 1; // creates new entry to start tracking that score
        }
    }

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
    graphContainer.appendChild(graph);

    let tableView = createTableVerOfTokenGraph(scoresCounts);
    tableView.id = fileName + "scoredTokensTable";
    graphContainer.appendChild(tableView);

    location.appendChild(graphContainer);
}






export function graphDocumentScores(documentScores, location) {
    let graphContainer = createGraphContainer("documentScore", "documentScore");
    let graph = gen("div");
    graph.id = "corpusScoresGraph";

    let xPoints = [];
    let yPoints = [];
    let labelsList = [];

    for (let i = 0; i < documentScores.length; i++) {
        let documentInfo = documentScores[i];
        xPoints.push(documentInfo.score);
        yPoints.push(documentInfo.percentTokensScored);
        labelsList.push(documentInfo.file);
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

    graph.on('plotly_click', function (data) {
        for (var i = 0; i < data.points.length; i++) {
            var pn = data.points[i].pointNumber;
            // let tn = data.points[i].curveNumber;
            addEventListener("click", (e) => {
                console.log(pn)
                console.log(data.points[i]);
            })
        };
    });

    graphContainer.appendChild(graph);

    let tableView = createTableVerOfDocumentScoresGraph(documentScores);
    tableView.id = "corpusScoresTable";
    graphContainer.appendChild(tableView);

    location.prepend(graphContainer); // need to add graph to site before we can query select for points

    // attempt to add event listeners to points so that clicking them could take user to the data for that document
    // let points = document.querySelectorAll("path.point");
    // console.log(points);
    // for (let i = 0; i < points.length; i++) {
    //     let point = points[i];
    //     console.log(point.id)
    //     // point.id = point.data
    // }


    // return graph;
}





function createGraphContainer(type, nameForID) {
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
    for (let i = 0; i < Object.keys(scoresCounts).length; i++) {
        let rowContainer = gen("tr");
        let score = Object.keys(scoresCounts)[i];
        let count = Object.values(scoresCounts)[i];

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

// function createTableBody(numRows, cellData) {
//     let tableBody = gen("tbody");
//     for (let i = 0; i < numRows; i++) {
//         let rowContainer = gen("tr");






//         let score = Object.keys(scoresCounts)[i];
//         let count = Object.values(scoresCounts)[i];

//         let scoreCell = gen("td");
//         scoreCell.textContent = score;
//         rowContainer.appendChild(scoreCell);

//         let countCell = gen("td");
//         countCell.textContent = count;
//         rowContainer.appendChild(countCell)

//         tableBody.appendChild(rowContainer);
//     }
//     return tableBody;
// }