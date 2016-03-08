
var page;


function load(router){
	page = $('#first-load-dialog');

	$('#btnCreateGame').on('click', function(){
		router.go('create');
	});

	$('#btnJoinGame').on('click', function(){
		router.go('room', {room: 'lobby'});
	});

	var VERSION = '1.0';
	$('#versionText').html('&#169;' + (new Date().getFullYear()) + ' Friendly Games Inc.  Version <a href="/codes" id="versionLink">' + VERSION + '</a>');


	client.socket.on('stats', function(data){
		var nusers = data.users;
		var ngames = data.games;

		if(nusers > 1){
			$('#userCount').html('<br /><b>' + nusers + ' users online playing ' + ngames + ' game' + (ngames !== 1? 's' : '') + '</b>');
		}
		else{
			$('#userCount').html('');
		}
	});

	client.socket.emit('ready');
}

function enter(state){
	page.modal('show');
}

function leave(){
	page.modal('hide');
}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
