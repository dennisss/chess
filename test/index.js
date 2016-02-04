var chai = require('chai'),
	path = require('path');

global.assert = chai.assert;

global.__src = path.resolve(__dirname + '/../src');

describe('Friendly Chess', function() {
	require('./app');
	require('./web');
});
