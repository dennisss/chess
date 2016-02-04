'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path');

global.async = require('async');
global._ = require('underscore');

function serve(){

	var app = express();
	var server = require('http').Server(app);


	// Setup routing
	require('./socket')(server);
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
	server.listen(8000, function(){ console.log('Server listening') });
}



