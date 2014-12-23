// Copyright 2014 Rackspace Inc.
// All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
//
// This SOFTWARE PRODUCT is provided by THE PROVIDER "as is" and "with all faults."
// THE PROVIDER makes no representations or warranties of any kind concerning the
// safety, suitability, lack of viruses, inaccuracies, typographical errors, or
// other harmful components of this SOFTWARE PRODUCT. There are inherent dangers
// in the use of any software, and you are solely responsible for determining
// whether this SOFTWARE PRODUCT is compatible with your equipment and other
// software installed on your equipment. You are also solely responsible for the
// protection of your equipment and backup of your data, and THE PROVIDER will
// not be liable for any damages you may suffer in connection with using,
// modifying, or distributing this SOFTWARE PRODUCT.


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

// URL handlers, only this white list of resources are accessible
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});
app.get('/draw.js', function(req, res){
  res.sendFile(__dirname + '/draw.js');
});
app.get('/aster_data.csv', function(req, res){
  res.sendFile(__dirname + '/aster_data.csv');
});
app.get('/d3.min.js', function(req, res){
  res.sendFile(__dirname + '/d3.min.js');
});
app.get('/socket.io/socket.io.js', function(req, res){
  res.sendFile(__dirname + '/socket.io.js');
});
app.get('/gradient.jpg', function(req, res){
  res.sendFile(__dirname + '/gradient.jpeg');
});


// The following sections of code watch files for updates and
// will automatically push a websockets command to the user's
// web browser and d3 will automatically update the GUI with the
// new data.

// This command sends the aster chart data
fs.watchFile('./aster_data.csv', function(curr,prev) {
    console.log("aster_data.csv changed");
    io.sockets.emit('command', 'white');
});

// This command sends the tweet text
fs.watchFile('./tweets.txt', function(curr,prev) {
    console.log("tweets.txt changed");
    fs.readFile('./tweets.txt', function (err,data) {
      if (err) {
        return console.log(err);
      }
      tweets = data.toString();
      io.sockets.emit('tweets', tweets);
    });
});

// This sends the clear tweet text command
fs.watchFile('./cleartweets.txt', function(curr,prev) {
    console.log("cleartweets.txt changed");
    io.sockets.emit('cleartweets', "");
});

// This causes Node.js to listen to port 80; change as needed
http.listen(80, function(){
  console.log('listening');
});
