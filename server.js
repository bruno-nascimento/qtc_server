#!/bin/env node
// server.js

// Import all our dependencies
var express  = require('express');
var app      = express();
var server   = require('http').Server(app);
var io       = require('socket.io')(server);
var path = require('path'); 
var bodyParser = require('body-parser');

var config = require('./qtc_libs/config.js');
var mongo = require('./qtc_libs/mongo.js');
var lwip = require('lwip');

app.use(express.static(config.files.dir));

/*||||||||||||||||||||||ROUTES|||||||||||||||||||||||||*/
// route for our index file

app.use(bodyParser.json({limit: '5mb'}));    
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  //send the index.html in our public directory
  res.sendFile(path.join(__dirname, './static', 'index.html'));
});

app.get('/rooms', function(req, res){

  mongo.models.Sala().find().exec().then(function(salas){
    res.json(salas);
  });

});

app.post('/room', function(req, res){
  console.log(req.body);
  if(!req.body.imagem){
    mongo.models.Sala().create(req.body, function (err, sala) {
      if (err) return next(err);
        res.json(201);
    });
    return;
  }

  //[0] = regex usada para o replace; [1] = type da imagem
  var imageTypeMatches = req.body.imagem.match(/^data:image\/(.*);base64,/,'');
  var clean_base64_image = req.body.imagem.replace(imageTypeMatches[0],'');

  var binaryData = new Buffer(clean_base64_image, 'base64');

  lwip.open(binaryData, imageTypeMatches[1], function(err, image){
    var img_factor = 40/(image.height() < image.width() ? image.height() : image.width());
    image.batch()
      .scale(img_factor)          // scale to 75%
      .toBuffer(imageTypeMatches[1], function(err, buffer){
        var sala_request = req.body;
        if(err){
          sala_request.imagem = {}
        }
        sala_request.imagem = {data : new Buffer(buffer, 'binary').toString('base64'), contentType : imageTypeMatches[1]}
        mongo.models.Sala().create(sala_request, function (err, sala) {
          if (err) return next(err);
            res.json(201);
        });
      });
  });
});

app.post('/register_user', function(req, res){
  mongo.models.Usuario().create(req.body, function (err, usuario) {
    if (err) return next(err);
    res.json(usuario);
  });
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

server.listen(config.server.port, config.server.ip, function() {
    console.log('%s: Node server started on %s:%d ...',new Date(), config.server.ip, config.server.port);
});


var teste_usuario = function(){
  mongo.models.Usuario().collection.remove();

  var usuario_teste = new mongo.models.Usuario()({apelido: 'teste', nome: 'teste da silva', email: 'teste@teste.com', senha: 'teste', amigos: [], bloqueados: []});

  var usuario_bloqueado = new mongo.models.Usuario()({apelido: 'bloc', nome: 'bloc', email: 'bloc', senha: 'bloc', amigos: [], bloqueados: []});

  usuario_teste.bloqueados.push(usuario_bloqueado);

  usuario_bloqueado.save(function (err) {
    if (err) return handleError(err);
  });

  usuario_teste.save(function (err) {
    if (err) return handleError(err);
  });

  mongo.models.Usuario()
    .findOne({ apelido: 'teste' })
    .populate('bloqueados', 'apelido nome')
    .exec(function (err, usuario) {
      if (err) return handleError(err);
  }).then(function(usuario){console.log(usuario)});

    return {'usuario' : usuario_teste, 'bloqueado' : usuario_bloqueado};
}

var executar_teste_sala = function(){
  var usuarios_teste = teste_usuario();

  mongo.models.Sala().collection.remove();

  var sala_teste = new mongo.models.Sala()({nome: 'sala legal teste', descricao: 'descricao bacana', publica: true});

  sala_teste.dono = usuarios_teste.usuario;
  sala_teste.banidos.push(usuarios_teste.bloqueado);
  sala_teste.usuarios.push(usuarios_teste.usuario);
  sala_teste.usuarios.push(usuarios_teste.bloqueado);

  sala_teste.save(function (err) {
    if (err) return handleError(err);
  });

   var sala_from_db = mongo.models.Sala()
      .findOne({ _id: sala_teste._id })
      .populate('banidos', 'apelido')
      .populate('dono', 'apelido')
      .populate('usuarios', 'apelido')
      .exec(function (err, usuario) {
        if (err) return handleError(err);
    });

  sala_from_db.then(function(success){console.log(success)});  
}


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