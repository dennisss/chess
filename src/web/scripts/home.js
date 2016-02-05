
var page;


function load(router){
	page = $('#first-load-dialog');

	$('#btnCreateGame').on('click', function(){
		router.go('create');
	})

	$('#btnJoinGame').on('click', function(){
		router.go('room', {room: 'lobby'});
	});

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
