var ctx, data, options, myRadarChart;

ctx = document.getElementById("myChart").getContext("2d");
options = {
    pointLabelFontSize : 18,
    pointLabelFontColor : "#000",
};


data = {
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
    data.labels = ["", "", "", "", ""];
    data.datasets[0].data = [0,0,0,0,0];
    data.datasets[1].data = [0,0,0,0,0];

    myRadarChart = new Chart(ctx).Radar(data, options);
}

console.log(myRadarChart);

function rebuildChart(tweets) {
    myRadarChart.destroy();

    var labelIndex = 0;
    var labelIndexes = {};
    var labels = []
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

        data.datasets[sentimentIndex].data = sentimentCount;
    }

    data.labels = labels;

    myRadarChart = new Chart(ctx).Radar(data, options);
}

function updateChart(chartData) {
    for (var i = 0, l=chartData.data.length; i < l; i++) {
        for (var a = 0, b=chartData.data[i].length; a < b; a++) {
            myRadarChart.datasets[i].points[a].value = chartData.data[i][a];
        }
    }
    myRadarChart.update();
}

function checkLabels(newLabels) {
    if (data.labels.length != newLabels.length) {
        return false;
    }

    for (var i = 0, l=labels.length; i < l; i++) {
        if (labels[i] != newLabels[i]) {
            return false;
        }
    }

    return true;
}

function writeChart(chartData) {
    if(!checkLabels(chartData.labels)) {
        rebuildChart(chartData);
    } else {
        updateChart(chartData);
    }
}

initChart();
