var mocha = require('mocha'),
	coMocha = require('co-mocha');

coMocha(mocha);


var chai = require('chai'),
	path = require('path');

global.assert = chai.assert;

global.__src = path.resolve(__dirname + '/../src');

global.pause = function(msecs){
	return new Promise(function(res){
		setTimeout(function(){
			res();
		}, msecs);
	});
}



describe('Friendly Chess', function() {
	require('./rpc');
	require('./chess');
	require('./position');

	require('./client');
	require('./server');

	require('./app');
	require('./web');

	require('./user');
});
