'use strict';

var express = require('express'),
	bodyParser = require('body-parser');

var app = express();
var server = require('http').Server(app);

app.use(express.static(__dirname + '/../../public'));
app.use(bodyParser.json());


if(require.main == module){
	server.listen(8000, function(){ console.log('Server listening') });
}
