var _ = require('underscore');

/**
 * Maps URLS to different states in the app
 */
function Router(options){

	function splitpath(path){
		if(!path) // TODO: Why is it parsing something empty
			return [];

		var arr = path.split('/');
		for(var i = 0; i < arr.length; i++){
			if(arr[i].trim().length === 0){
				arr.splice(i, 1);
				i--;
			}
		}
		return arr;
	}

	// Given a path and its pattern, try to parse it into list of parameters (or NULL if it can't be parsed)
	// i.e  parsepath('/r/hello' '/r/:room') should return { room: 'hello' }
	function parsepath(path, pattern){

		path = splitpath(path), pattern = splitpath(pattern);

		if(path.length != pattern.length)
			return null;

		var params = {};
		for(var i = 0; i < pattern.length; i++){

			if(pattern[i].charAt(0) == ':'){ // Capture group
				var name = pattern[i].slice(1);
				params[name] = decodeURIComponent(path[i]);
			}
			else{ // Matching pattern
				if(pattern[i] != path[i])
					return null;
			}
		}

		return params;
	}

	// Given a set of params and a pattern, make a url.
	// i.e. createpath({ room: 'hello' }, '/r/:room') should return '/r/hello'
	function createpath(params, pattern){

		var parts = [];
		pattern = splitpath(pattern);
		for(var i = 0; i < pattern.length; i++){

			if(pattern[i].charAt(0) == ':'){
				var name = pattern[i].slice(1);
				parts.push(encodeURIComponent(params[name]));
			}
			else
				parts.push(pattern[i]);
		}

		return '/' + parts.join('/');
	}


	// All the states for the app
	var states = options.states;

	var goto_func;

	// The current state of the program
	var current_state = null;

	// Actually run a state once already n it
	function runState(name, params){
		if(current_state){
			states[current_state.name].controller.leave();
		}

		var s = { name: name, params: params, go: goto_func };
		current_state = s;
		states[name].controller.enter(s);
	}

	// Change the state by its name
	function goto(name, params){
		if(!params)
			params = {};

		var newpath = createpath(params, states[name].path);
		if(newpath != location.pathname) // TODO: Otherwise do a replaceState?
			window.history.pushState({name: name, params: params}, "Title", newpath);
		runState(name, params);
	}
	goto_func = goto;



	// Change the state based on a path
	function gotoPath(path){

		var keys = _.keys(states);
		for(var i = 0; i < keys.length; i++){
			var s = states[keys[i]];

			// Try to parse
			var params = parsepath(path, s.path);
			if(params){
				goto(keys[i], params);
				return;
			}
		}

		// Fallback if no state matched
		if(options.default){
			goto(options.default, {});
		}
	}




	// Parse things

	// TODO: Most browsers will call this onload

	function popstate(){
		var path = location.pathname;
		gotoPath(path);
	}

	function load(){

		// Load all states
		var keys = _.keys(states);
		for(var i = 0; i < keys.length; i++){
			var s = states[keys[i]];
			s.controller.load({
				go: goto_func,
				back: function(){ window.history.back(); },
				link: function(name, params){ // Makes a link to a state
					var s = states[name];
					var path = createpath(params, s.path);
					return location.origin + path;
				}

			});
		}


		popstate();
		setTimeout(function() {
			$(window).on('popstate', popstate);
		}, 0);
	}


	if(document.readyState == 'complete')
		load();
	else
		$(window).on('load', load);

}


module.exports = Router;
