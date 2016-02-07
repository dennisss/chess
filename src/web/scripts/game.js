var Chess = require('../../chess');

var game;

function load(router){

	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();



}

function enter(state){

	if(!state.params.hasOwnProperty('data')){
		state.go('home');
		return;
	}


	game = new Chess.Game(state.params.data);

	console.log(game);

	// Draw me!



	var thisPlayer = state.params.thisPlayer;
	var opName = state.params.opName;


	$(".thisPlayerName").html(thisPlayer);
	$(".otherPlayerName").html(opName);
	$("#thisPlayerInfo").show();
	$("#thatPlayerInfo").show();

	$("#forfeitGame").click(function() {
		$("#forfitNotification").modal("show");
	});

	$("#drawGame").click(function() {
		$("#drawNotification").modal("show");
	});



	$("#forfeitDone").click(function() {
		router.go('room', {room: 'lobby'});
	});

}

function leave(){

	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();

}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
