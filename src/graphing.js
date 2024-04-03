import { id, gen } from './utils.js'

export function graphTokenScores(location, scoredWords) {

    let graph = gen("div");
    graph.classList.add("scoredTokensGraph");

    let scores = {
        "-5": 0, "-4": 0, "-3": 0, "-2": 0, "-1": 0,
        "1": 0, "2": 0, "3": 0, "4": 0, "5": 0
    }

    for (let i = 0; i < scoredWords.length; i++) {
        let entry = scoredWords[i];
        scores[entry.score] = scores[entry.score] + 1;
    }

    let trace = {
        x: Object.keys(scores),
        y: Object.values(scores),
        type: 'bar',
        text: Object.values(scores).map(String),
        textposition: 'auto',
        hoverinfo: 'none',
        // hoverinfo: Object.values(scores),
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
            tickvals: [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
        },
        yaxis: {title: "Number of Words"},
        paper_bgcolor: '#F7FBDA',
        plot_bgcolor: '#F7FBDA'
    }

    Plotly.newPlot(graph, data, layout)


    location.appendChild(graph);
}