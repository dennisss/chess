'use strict';

/**
 * Remote Procedure Call abtraction for any EventEmitter style channel
 *
 * This requires a persistent connection to the same server during the whole call
 * TODO: Jobs should be savable and processable in the background
 */
class RPC {


	constructor(socket, serve){

		this.socket = socket;


		var self = this;


		if(serve){

			// Methods registered with the server
			this.methods = {};

			// Last id received from the client
			this.lastId = 0;

			socket.on('call', function(data){ self._oncall(data); });

		}
		else{

			// All the sent or received calls
			this.jobs = {};

			this.id = 0;

			socket.on('call_result', function(data){ self._oncall_result(data); });
		}
	}


	// When the server gets a call from a client
	_oncall(data){


		var self = this;

		var id = data.id;

		// TODO: Check id presence and ensure it is an integer

		// Enforce receiving id's in ascending order
		if(id <= this.lastId){
			console.log('RPC: Out of order packets or old request detected');
			return;
		}

		this.lastId = id;


		if(!data.hasOwnProperty('method') || !data.hasOwnProperty('params')){

			console.log(data);
			console.warn('RPC: Received invalid or incomplete call request');
			// Respond with an error
			return;
		}

		// TODO: Type check



		function callback(err, ret){
			self.socket.emit('call_result', {
				id: id,
				result: ret,
				error: err
			});
		}

		function progress(data){
			self.socket.emit('call_result', {
				id: id,
				progress: data
			});

		}



		if(!this.methods.hasOwnProperty(data.method)){
			// Respond with an error
			callback('No known method: ' + data.method);
			return;
		}




		// Actually call the method
		// TODO: Try, catch this.
		try{
			this.methods[data.method](data.params, callback, progress);
		}
		catch(e){
			console.log(e.stack);
			callback(e, undefined);
			// Callback with an error
		}


		//this.methods.hasOwnProperty()


	}


	// When a client gets a result from a server
	_oncall_result(data){
		if(!data.hasOwnProperty('id')){
			console.warn('RPC: Result missing id');
			return;
		}

		// TODO: Validate that it is an integer

		if(!this.jobs.hasOwnProperty(data.id)){
			console.warn('RPC: No job with the received id. Duplicate response?');
			return;
		}


		var j = this.jobs[data.id];

		if(data.hasOwnProperty('result') || data.hasOwnProperty('error')){ // Got a return value

			delete this.jobs[data.id];

			if(j.callback){
				j.callback(data.error, data.result);
			}
			else if(j.promise){
				//console.log(j.promise.resolve);
				//console.log(data)
				if(data.error)
					j.promise.reject(data.error);
				else
					j.promise.resolve(data.result);
			}
		}
		else if(data.hasOwnProperty('progress')){ // Incremental status message
			if(j.progress)
				j.progress(data.progress);
		}
		else{
			console.warn('RPC: Could not parse result: ' + JSON.stringify(data));
		}
	}



	/**
	 * Call an external procedure
	 *
	 * @param {string} method the name of the remote procedure
	 * @param params an object or array sent to the server
	 * @param callback a function to be called when the procedure finishes
	 * @param progress optional function called if the procedure supports incremental progress reports
	 * @return {int} id identifying the job which can be used to cancel it
	 */
	call(method, params, callback, progress){

		if(!this.jobs){
			console.warn('Can only call this from a client');
			return;
		}

		var id = ++this.id;
		var job = { method: method, params: params, callback: callback, progress: progress };
		this.jobs[id] = job;

		if(!params)
			params = {};


		var p = null;
		// Called without a callback, ES6ify it
		if(arguments.length <= 2){
			p = new Promise(function(resolve, reject){
				job.promise = {
					resolve: resolve,
					reject: reject
				};
			});
		}


		// TODO: Retry after timeout and cancel after another timeout

		this.socket.emit('call', { method: method, params: params, id: id });


		if(p)
			return p;

		return id;
	}

	/**
	 * For a server, attach a method that can be called.
	 *
	 */
	register(method, func){
		this.methods[method] = func;
	}

}


module.exports = RPC;
