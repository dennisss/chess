'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	Server = require('../server');

global.async = require('async');
global._ = require('underscore');

function serve(){

	var app = express();
	var server = require('http').Server(app);


	// Setup routing
	var chessServer = new Server(server);
	app.use(express.static(__dirname + '/../../public'));
	app.use(bodyParser.json());
	app.get('*', function(req, res){
		res.type('html');
		res.sendFile(path.resolve(__dirname + '/../../public/index.html'));
	});

	return server;
}

// Send the plain HTTP requests here to forward them to HTTPS
function redirect_serve(){
	var app = express();
	var server = require('http').Server(app);

	app.use(function(req, res, next){
		// Redirect production server to https
		res.redirect('https://' + req.hostname + req.url);
	});

	return server;
}


module.exports = serve;

// Start it! (if running as an independent server)
if(require.main == module){
	// NOTE: cannot test this
	serve().listen(8000, function(){ console.log('Server listening');});
	redirect_serve().listen(8001);
}



