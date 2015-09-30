var app    = require('express')();
var http   = require('http').Server(app);
var io     = require('socket.io')(http);
var fs     = require('fs');
var kafka  = require('kafka-node');

var queue         = [];
var queue_size    = 200;
var dump_interval = 60000;
var dump_timeout;
var zk_port       = 2181;
var zk_nodes      = [1, 2, 3].map(function (i) { return 'zookeeper-' + i + '.local:' + zk_port});
var tweet_cache_json;
var tweet_cache_path = '/tmp/tweet_cache.json';

if (fs.existsSync(tweet_cache_path)) {
    tweet_cache_json = fs.readFileSync(tweet_cache_path);
    io.sockets.emit('tweets', tweet_cache_json);
}

var classifications = {
    '0': 'negative',
    '1': 'positive',
    '2': 'neutral'
}

function classify(messages) {
    var classified = {
        'positive': [],
        'neutral': [],
        'negative': []
    };
    for (var i=0; i<messages.length; i++) {
        var message = messages[i];
        var sentiment = classifications[message['score']];
        if (sentiment) {
            classified[sentiment].push(message);
        }
        else {
            console.log("Score", message['score'], "is not valid", message)
        }
    }
    return classified;
}

function dump_queue() {
    if (queue.length > 0) {
        console.log("Emitting queue to UI");
        tweet_cache_json = JSON.stringify(classify(queue))
        fs.writeFile(tweet_cache_path, tweet_cache_json);
        io.sockets.emit('tweets', tweet_cache_json);
        queue = [];
    }
    dump_timeout = setTimeout(dump_queue, dump_interval);
}

dump_timeout = setTimeout(dump_queue, dump_interval);

var kafka_connection_str = zk_nodes.join(',');
var kafka_client = new kafka.Client(kafka_connection_str,
                                    'sentiment-analysis',
                                    { 'retries': 10 });
var kafka_consumer = new kafka.HighLevelConsumer(kafka_client, [{
   topic: 'scored-tweets'
}]);
kafka_consumer.on('message', function (message) {
    console.log("Got message from kafka:", message)
    if (queue.length >= queue_size) {
        clearTimeout(dump_timeout);
        dump_queue();
    }
    try {
        queue.push(JSON.parse(message['value']));
    }
    catch (e) {
        console.log("ERROR parsing JSON:", e)
    }
});

// URL handlers, only this white list of resources are accessible
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/tweet_cache.json', function(req, res){
  res.sendFile(tweet_cache_path);
});

app.get('/css/main.css', function(req, res){
  res.sendFile(__dirname + '/css/main.css');
});

app.get('/chart-js/Chart.js', function(req, res){
  res.sendFile(__dirname + '/chart-js/Chart.js');
});

app.get('/js/tweets.js', function(req, res){
  res.sendFile(__dirname + '/js/tweets.js');
});

app.get('/js/heatmap.js', function(req, res){
  res.sendFile(__dirname + '/js/heatmap.js');
});

app.get('/js/chart.js', function(req, res){
  res.sendFile(__dirname + '/js/chart.js');
});


http.listen(80, function(){
  console.log('listening');
});
