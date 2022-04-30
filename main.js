// This script file was originally written by Tatsuya Ikuta
// and provided as Public Domain (CC0).
// https://creativecommons.org/publicdomain/zero/1.0/legalcode

var filelist = new Array();
function dropHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    filelist = filelist.concat(Array.from(event.dataTransfer.files));
    updateGraph();
}

function dragOverHandler(event) {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function initGraph() {
    let GRAPH = document.getElementById('graph');   

    var layout = {
        margin: {t: 0, b: 50, l: 50, r: 0},
        showlegend: true,
        xaxis: {
            title: 'Volume [mL]'
        },
        yaxis: {
            title: 'Intensity'
        },
        legend: {orientation: "h"},
        width: 700,
        height: 450
    }

    var config = {
        editable: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['toImage'],
        modeBarButtonsToAdd: [
            {              
                name: 'Download plot as PNG',
                icon: Plotly.Icons.camera,
                click: function(gd) {
                    Plotly.downloadImage(gd, {format: 'png'})
                }
            },
            {
                name: 'Download plot as SVG',
                icon: Plotly.Icons.movie,
                click: function(gd) {
                    Plotly.downloadImage(gd, {format: 'svg'})
                }
            }
        ]
    }
    Plotly.newPlot(GRAPH, [], layout, config);
}

function updateGraph() {
    let GRAPH = document.getElementById('graph');
    while (GRAPH.data.length > 0) {
        Plotly.deleteTraces(GRAPH, 0)
    }

    for (var i = 0; i < filelist.length; i++) {
        var reader = new FileReader();
        reader.readAsText(filelist[i], 'shift-jis');
        reader.label = filelist[i].name;
        reader.onload = function (event) {
            var trace = parseShimadzu(event.target.label, event.target.result);

            if (trace === null) {
                // error
                console.log("Fialed to parse", event.target.label);
                return;
            }
            Plotly.addTraces(GRAPH, [trace]);
        };
    }
}

function parseShimadzu(label, text) {
    var sections = text.split(/\n\s*\n/);
    for (var i = 0; i < sections.length; i++) {
        var lines = sections[i].split('\n');

        let detector = document.getElementById('detector');
        let channel = document.getElementById('channel');

        let flowrate = Number(document.getElementById('flowrate').value);

        section_name = "[LC Chromatogram(Detector " + detector.value + "-Ch" + channel.value + ")]";

        if (lines[0].indexOf(section_name) >= 0)  { // Note that the raw line contains '\n'.
            var xarr = new Array();
            var yarr = new Array();
            for (var j = 9; j < lines.length; j++) {
                var cols = lines[j].split('\t');

                xarr.push(Number(cols[0]) * flowrate);
                yarr.push(Number(cols[1]));
            }

            return {x: xarr, y: yarr, mode: 'lines', name: label};
        }
    }
    return null;
}

function clearGraph(event) {
    filelist = [];
    let GRAPH = document.getElementById('graph');
    while (GRAPH.data.length > 0) {
        Plotly.deleteTraces(GRAPH, 0)
    }
}
