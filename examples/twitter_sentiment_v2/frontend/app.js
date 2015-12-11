var app    = require('express')();
var http   = require('http').Server(app);
var io     = require('socket.io')(http);
var fs     = require('fs');
var ini    = require('ini');
var kafka  = require('kafka-node');
var _      = require('underscore');

var opts = require('nomnom')
    .option('conf', {
        abbr: 'c',
        help: 'Path to the config file'
    })
    .parse();

var config = ini.parse(fs.readFileSync(opts.conf, 'utf-8'));

var numPartitions = parseInt(config['spark.sentimentApp.numKafkaPartitions'], 10);
var kafkaTopic    = config['spark.sentimentApp.kafkaQueue'];
var kafkaQueues   = _.range(numPartitions).map(function (i) { return { topic: kafkaTopic, partition: i } });

var queue         = [];
var queue_size    = parseInt(config['spark.sentimentApp.clientQueueSize'], 10);
var dump_interval = parseInt(config['spark.sentimentApp.clientRefreshInterval'], 10) * 1000;
var dump_timeout;

var zk_nodes      = config['spark.sentimentApp.zookeeperHosts'];

var tweet_cache_path = config['spark.sentimentApp.clientQueueCache'];

if (fs.existsSync(tweet_cache_path)) {
    io.sockets.emit('tweets', fs.readFileSync(tweet_cache_path));
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
        var queue_json = JSON.stringify(classify(queue))
        fs.writeFile(tweet_cache_path, queue_json);
        io.sockets.emit('tweets', queue_json);
        queue = [];
    }
    dump_timeout = setTimeout(dump_queue, dump_interval);
}

dump_timeout = setTimeout(dump_queue, dump_interval);

var kafka_consumer;
var reset_kafka;
reset_kafka = function () {
    var kafka_client = new kafka.Client(zk_nodes,
                                    'sentiment-analysis',
                                    { 'retries': 10 });
    var on_error = function (error) {
        console.log("Got kafka error:", error);
        if (kafka_consumer) {
            try {
                kafka_consumer.removeAllListeners();
                kafka_consumer.close();
            } catch (e) {
                console.log("Could not close kafka consumer:", e);
            }
        }
        try {
            kafka_client.removeAllListeners();
            kafka_client.close();
        } catch (e) {
            console.log("Could not close kafka client:", e);
        }
        reset_kafka();
    };
    kafka_client.on('error', on_error);

    kafka_consumer = new kafka.HighLevelConsumer(kafka_client, kafkaQueues);
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

    kafka_consumer.on('error', on_error);
    kafka_consumer.on('offsetOutOfRange', function (err) {
        // no idea how this happens, but just start over if it does
        // I can't find a way to get the max offset
        console.log('Resetting offset for', err['topic'], 'partition:', err['partition']);
        kafka_consumer.setOffset(err['topic'], err['partition'], 0);
    });
}

reset_kafka();

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
