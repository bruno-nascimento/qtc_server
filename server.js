// server.js

// Import all our dependencies
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);

var path = require('path');  

//app.use(express.static(__dirname + '/public'));

/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/
// route for our index file
app.get('/', function(req, res) {
  //send the index.html in our public directory
  res.sendFile(path.join(__dirname, './static', 'index.html'));
});

//mongoose.connect("mongodb://127.0.0.1:27017/scotch-chat");

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// server.js

/*||||||||||||||||SOCKET|||||||||||||||||||||||*/
io.on('connection', function(socket){
	console.log('a user connected');
  	socket.on('chat message', function(msg){
  		console.log(msg);
    	io.emit('chat message', msg);
  	});
  	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});
/*||||||||||||||||||||END SOCKETS||||||||||||||||||*/

server.listen(8080, function(){
  console.log('listening on *:8080');
});
