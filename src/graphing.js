import { id, gen } from './utils.js'

export function graphTokenScores(location, scoredWords) {

    let graph = gen("div");
    graph.classList.add("scoredTokensGraph");

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


    location.appendChild(graph);
}






export function graphDocumentScores(documentScores, location) {
    let graph = gen("div");
    graph.classList.add("corpusScoresGraph");

    console.log(documentScores)

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
                // gradient: { // does a gradient on the marker
                //     color: '#193819',
                //     type: 'horizontal'
                // }
            },
            // fill: "tonextx", // can't seem to predict how fills work
            text: labelsList,
            type: 'scatter',
            hovertemplate: '<b><i>%{text}</i></b>' +
                            '<br>Document Score: %{x}<br>' +
                            'Percent of Tokens Scored: %{y}% <extra></extra>' // <extra></extra> removes weird "trace0" label
        }
    ];

    let layout = {
        title: "Distribution of Document Scores",
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

    location.prepend(graph); // need to add graph to site before we can query select for points

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