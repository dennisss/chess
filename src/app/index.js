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


	app.enable('trust proxy');
	app.use(function(req, res, next){
		// Redirect production server to https
		if(req.protocol == 'http' && req.hostname == 'friendlychess.xyz'){
			res.redirect('https://' + req.hostname + req.url);
			return;
		}

		next();
	});


	// Setup routing
	var chessServer = new Server(server);
	app.use(express.static(__dirname + '/../../public'));
	app.use(bodyParser.json());
	app.get('*', function(req, res){
		res.type('html');
		res.sendFile(path.resolve(__dirname + '/../../public/index.html'));
	})

	return server;
}

module.exports = serve;

// Start it! (if running as an independent server)
if(require.main == module){
	serve().listen(8000, function(){ console.log('Server listening') });
}



