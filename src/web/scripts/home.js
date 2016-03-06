
var page;


function load(router){
	page = $('#first-load-dialog');

	$('#btnCreateGame').on('click', function(){
		router.go('create');
	})

	$('#btnJoinGame').on('click', function(){
		router.go('room', {room: 'lobby'});
	});

	var VERSION = '0.90'
	$('#versionText').html('&#169;' + (new Date().getFullYear()) + ' Friendly Games Inc.  Version ' + VERSION);



	client.socket.on('user_count', function(nusers){
		if(nusers > 1){
			$('#userCount').html('<br /><b>' + nusers + ' users online</b>');
		}
		else{
			$('#userCount').html('');
		}
	})
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
