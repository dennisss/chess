var Client = require('../../client'),
	Chess = require('../../chess'),
	FastClick = require('fastclick');

var client = new Client();
window.client = client;


var Router = require('./router');

var Connect = require('./connect');


Router({
	states: {
		home: { // Landing page
			path: '/home',
			controller: require('./home')
		},

		create: { // Create a room page
			path: '/create',
			controller: require('./create')
		},

		room: { // In a room page
			path: '/r/:room',
			controller: require('./room')
		},

		game: { // In a game page
			path: '/game',
			controller: require('./game')
		}

	},

	default: 'home'
});



window.alert = function(){ console.warn('Please by more friendly!');  };


$(function(){

	// No touch delay on mobile
	FastClick.attach(document.body);

	$.material.init();

	$('[data-toggle="tooltip"]').tooltip();

});
