var ctx, chartData, options, myRadarChart, oldLabels;
var labelIndex = 0;
var labelIndexes = {};
var labels = []

ctx = document.getElementById("myChart").getContext("2d");
options = {
    pointLabelFontSize : 18,
    pointLabelFontColor : "#000",
};

chartData = {
    datasets: [
        {
            label: "Positive Sentiment",
            fillColor: "rgba(90,170,40,0.2)",
            strokeColor: "rgba(90,170,40,1)",
            pointColor: "rgba(90,170,40,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(90,170,40,1)"
        },
        {
            label: "Negative Sentiment",
            fillColor: "rgba(196,0,34,0.2)",
            strokeColor: "rgba(196,0,34,1)",
            pointColor: "rgba(196,0,34,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(196,0,34,1)"
        }
    ]
};

var sentimentIndexes = {
    'positive': 0,
    'negative': 1
};

function initChart() {
    chartData.labels = ["", "", "", "", ""];
    chartData.datasets[0].data = [0,0,0,0,0];
    chartData.datasets[1].data = [0,0,0,0,0];

    myRadarChart = new Chart(ctx).Radar(chartData, options);
}

function buildChartData(tweets) {
    for (var sentiment in sentimentIndexes) {
        var sentimentIndex = sentimentIndexes[sentiment];
        var sentimentCount = [];
        if (labels.length > 0) {
            for (var i=0; i<labels.length; i++) {
                sentimentCount[i] = 0;
            }
        }
        for (var i=0; i<tweets[sentiment].length; i++) {
            var tweet = tweets[sentiment][i];
            for (var j=0; j<tweet['keywords'].length; j++) {
                var label = tweet['keywords'][j];
                if (labelIndexes[label] == undefined) {
                    sentimentCount[labelIndex] = 1;
                    labels[labelIndex] = label;
                    labelIndexes[label] = labelIndex++;
                }
                else {
                    sentimentCount[labelIndexes[label]]++;
                }
            }
        }

        chartData.datasets[sentimentIndex].data = sentimentCount;
    }

    oldLabels = chartData.labels;
    chartData.labels = labels;

    writeChart();
}

function rebuildChart() {
    myRadarChart.destroy();
    myRadarChart = new Chart(ctx).Radar(chartData, options);
}

function updateChart() {
    for (var i = 0, l=chartData.datasets.length; i < l; i++) {
        for (var a = 0, b=chartData.datasets[i].data.length; a < b; a++) {
            if (myRadarChart.datasets[i].points[a] === undefined) {
                // somehow there is no existing data even though the labels were a match
                // go ahead and nuke from orbit
                rebuildChart();
                return;
            }
            myRadarChart.datasets[i].points[a].value = chartData.datasets[i].data[a];
        }
    }
    myRadarChart.update();
}

function checkLabels() {
    if (chartData.labels.length != oldLabels.length) {
        return false;
    }

    for (var i = 0, l=chartData.labels.length; i < l; i++) {
        if (chartData.labels[i] != oldLabels[i]) {
            return false;
        }
    }

    return true;
}

function writeChart() {
    if(!checkLabels()) {
        rebuildChart();
    } else {
        updateChart();
    }
}

initChart();