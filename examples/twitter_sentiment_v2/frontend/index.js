var http = require('http').createServer(handler)
var io   = require('socket.io')(http);
var fs   = require('fs');
var kafka = require('kafka-node');

var queue = [];
var queue_size = 50;
var dump_interval = 15000;
var dump_timeout;
var zk_port = 2181;
var zk_nodes = [1, 2, 3].map(function (i) { return 'zookeeper-' + i + '.local:' + zk_port});


var classifications = {
    '0.0': 'negative',
    '1.0': 'positive',
    '2.0': 'neutral'
}

function classify(messages) {
    var classified = {
        'positive': [],
        'neutral': [],
        'negative': []
    };
    for (var i=0; i<messages.length; i++) {
        var message = messages[i];
        classified[classifications[message['score']]].push(message);
    }
    return classified;
}

function dump_queue() {
    console.log("Emitting queue to UI");
    io.sockets.emit('text', JSON.stringify(classify(queue)));
    queue = [];
    dump_timeout = setTimeout(dump_queue, dump_interval);
}

// dump every 15s no matter what, or sooner if we have enough activity
dump_timeout = setTimeout(dump_queue, dump_interval);

var kafka_connection_str = zk_nodes.join(',');
var kafka_client = new kafka.Client(kafka_connection_str,
                                    'sentiment-analysis',
                                    { 'retries': 10 });
var kafka_consumer = new kafka.Consumer(kafka_client, [{
   topic: 'scored-tweets'
}]);
kafka_consumer.on('message', function (message) {
    console.log("Got message from kafka:", message)
    if (queue.length >= queue_size) {
        clearTimeout(dump_timeout);
        dump_queue();
    }
    queue.push(JSON.parse(message));
});

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

http.listen(8080, function(){
  console.log('listening');
});
