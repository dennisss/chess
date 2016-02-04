'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path');

global._ = require('underscore');

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

// Start it!
if(require.main == module){
	server.listen(8000, function(){ console.log('Server listening') });
}



