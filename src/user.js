'use strict';

var _ = require('underscore');

/**
 * Data associated with a person connected to the server
 *
 * @property {string} id unique identifier for the user
 * @property {string} name the display name of ths user
 * @property {string} level the skill level of the user (usually either, 'noob', 'novice', 'jedi', etc.)
 * @property {State} state server-side state of the app for this user
 */
class User {

	constructor(data){
		_.extend(this, data);
	}


}

module.exports = User;
