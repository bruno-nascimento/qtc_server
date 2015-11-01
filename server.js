#!/bin/env node
// server.js

// Import all our dependencies
var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);
var path = require('path');  

var self = this;

self.mongo = {};
self.mongo.host = process.env.OPENSHIFT_MONGODB_DB_HOST ? process.env.OPENSHIFT_MONGODB_DB_HOST : '127.0.0.1'; 
self.mongo.port = process.env.OPENSHIFT_MONGODB_DB_PORT || 27017;
self.mongo.db = 'server';
self.mongo.user = 'admin';
self.mongo.pass = '28jvPKgkTb7f';

//app.use(express.static(__dirname + '/static'));

/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/
// route for our index file
app.get('/', function(req, res) {
  //send the index.html in our public directory
  res.sendFile(path.join(__dirname, './static', 'index.html'));
});

app.get('/user_test', function(req, res){
    res.json(usuario_teste);
});

/* MONGO */ 
mongoose.connect("mongodb://"+self.mongo.user+":"+self.mongo.pass+"@"+self.mongo.host+":"+self.mongo.port+"/"+self.mongo.db);

// usuario = {
//     id,
//     apelido,
//     nome,
//     email,
//     senha,
//     usuarios_amigos[],
//     bloqueados[],
//     perfil = {
//         foto,
//         data_nascimento,
//         cidade,
//         estuda,
//         trabalha,
//         cargo,
//         hobbies[],
//         naturalDe,
//         facebook,
//         twitter,
//         frase
//     }
// }

var usuarioSchema = mongoose.Schema({ apelido: String, nome: String, email: String, senha: String, 
    amigos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }], bloqueados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }] });
var Usuario = mongoose.model('Usuario', usuarioSchema);

Usuario.collection.remove();

var usuario_teste = new Usuario({apelido: 'teste', nome: 'teste da silva', email: 'teste@teste.com', senha: 'teste', amigos: [], bloqueados: []});

var usuario_bloqueado = new Usuario({apelido: 'bloc', nome: 'bloc', email: 'bloc', senha: 'bloc', amigos: [], bloqueados: []});

usuario_teste.bloqueados.push(usuario_bloqueado);

usuario_bloqueado.save(function (err) {
  if (err) return handleError(err);
});

usuario_teste.save(function (err) {
  if (err) return handleError(err);
});

Usuario
.findOne({ apelido: 'teste' })
.populate('bloqueados')
.exec(function (err, usuario) {
  if (err) return handleError(err);
  console.log(">>>>>>>>>>>>>>> USUARIOOOOOOOOOOOOOOO :: ", usuario);
});

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

/* OPENSHIFT */

self.setupVariables = function() {
    //  Set the environment variables we need.
    self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
    self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

    if (typeof self.ipaddress === "undefined") {
        //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
        //  allows us to run/test the app locally.
        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
        self.ipaddress = "127.0.0.1";
    };
};

var terminator = function(sig){
    if (typeof sig === "string") {
       console.log('%s: Received %s - terminating sample app ...', Date(Date.now()), sig);
       process.exit(1);
    }
    console.log('%s: Node server stopped.', Date(Date.now()) );
};

process.on('exit', function() { terminator(); });
    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, function() { terminator(element); });
});

self.setupVariables();

server.listen(self.port, self.ipaddress, function() {
    console.log('%s: Node server started on %s:%d ...',Date(Date.now()), self.ipaddress, self.port);
});

// #!/bin/env node
// //  OpenShift sample Node application
// var express = require('express');
// var fs      = require('fs');


// /**
//  *  Define the sample application.
//  */
// var SampleApp = function() {

//     //  Scope.
//     var self = this;


//     /*  ================================================================  */
//     /*  Helper functions.                                                 */
//     /*  ================================================================  */

//     /**
//      *  Set up server IP address and port # using env variables/defaults.
//      */
//     self.setupVariables = function() {
//         //  Set the environment variables we need.
//         self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
//         self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

//         if (typeof self.ipaddress === "undefined") {
//             //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
//             //  allows us to run/test the app locally.
//             console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
//             self.ipaddress = "127.0.0.1";
//         };
//     };


//     /**
//      *  Populate the cache.
//      */
//     self.populateCache = function() {
//         if (typeof self.zcache === "undefined") {
//             self.zcache = { 'index.html': '' };
//         }

//         //  Local cache for static content.
//         self.zcache['index.html'] = fs.readFileSync('./index.html');
//     };


//     /**
//      *  Retrieve entry (content) from cache.
//      *  @param {string} key  Key identifying content to retrieve from cache.
//      */
//     self.cache_get = function(key) { return self.zcache[key]; };


//     /**
//      *  terminator === the termination handler
//      *  Terminate server on receipt of the specified signal.
//      *  @param {string} sig  Signal to terminate on.
//      */
//     self.terminator = function(sig){
//         if (typeof sig === "string") {
//            console.log('%s: Received %s - terminating sample app ...',
//                        Date(Date.now()), sig);
//            process.exit(1);
//         }
//         console.log('%s: Node server stopped.', Date(Date.now()) );
//     };


//     /**
//      *  Setup termination handlers (for exit and a list of signals).
//      */
//     self.setupTerminationHandlers = function(){
//         //  Process on exit and signals.
//         process.on('exit', function() { self.terminator(); });

//         // Removed 'SIGPIPE' from the list - bugz 852598.
//         ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
//          'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
//         ].forEach(function(element, index, array) {
//             process.on(element, function() { self.terminator(element); });
//         });
//     };


//     /*  ================================================================  */
//     /*  App server functions (main app logic here).                       */
//     /*  ================================================================  */

//     /**
//      *  Create the routing table entries + handlers for the application.
//      */
//     self.createRoutes = function() {
//         self.routes = { };

//         self.routes['/asciimo'] = function(req, res) {
//             var link = "http://i.imgur.com/kmbjB.png";
//             res.send("<html><body><img src='" + link + "'></body></html>");
//         };

//         self.routes['/'] = function(req, res) {
//             res.setHeader('Content-Type', 'text/html');
//             res.send(self.cache_get('index.html') );
//         };
//     };


//     /**
//      *  Initialize the server (express) and create the routes and register
//      *  the handlers.
//      */
//     self.initializeServer = function() {
//         self.createRoutes();
//         self.app = express.createServer();

//         //  Add handlers for the app (from the routes).
//         for (var r in self.routes) {
//             self.app.get(r, self.routes[r]);
//         }
//     };


//     /**
//      *  Initializes the sample application.
//      */
//     self.initialize = function() {
//         self.setupVariables();
//         self.populateCache();
//         self.setupTerminationHandlers();

//         // Create the express server and routes.
//         self.initializeServer();
//     };


//     /**
//      *  Start the server (starts up the sample application).
//      */
//     self.start = function() {
//         //  Start the app on the specific interface (and port).
//         self.app.listen(self.port, self.ipaddress, function() {
//             console.log('%s: Node server started on %s:%d ...',
//                         Date(Date.now() ), self.ipaddress, self.port);
//         });
//     };

// };   /*  Sample Application.  */



// /**
//  *  main():  Main code.
//  */
// var zapp = new SampleApp();
// zapp.initialize();
// zapp.start();