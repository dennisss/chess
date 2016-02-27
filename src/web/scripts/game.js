var Chess = require('../../chess'),
	BoardUi = require('./boardUi');

var game, boardUi;

function load(router){

	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();


	boardUi = new BoardUi($('.chessboard'));
	boardUi.root.css('opacity', 1);


	boardUi.on('move', function(move, callback){
		client.call('move', move, function(err){
			console.log(err);
			callback(err);
		});
	});


	client.socket.on('moved', function(data){
		var move = new Chess.Move(data);

		boardUi.updateBoard(game.board.apply(move));
		boardUi.updateState(1);
	})

}

function enter(state){

	if(!state.params.hasOwnProperty('data')){
		state.go('home');
		return;
	}


	game = new Chess.Game(state.params.data);

	console.log(game);

	// Figure out which color the current client is
	var me = client.socket.id == game.white_player.id ? Chess.Color.White : Chess.Color.Black;

	boardUi.start(game.board, me);


	var thisPlayer = state.params.thisPlayer;
	var opName = state.params.opName;

	$(".thisPlayerName").html(thisPlayer);
	$(".otherPlayerName").html(opName);
	$("#thisPlayerInfo").show();
	$("#thatPlayerInfo").show();

	$("#forfeitGame").click(function() {
		$("#forfitNotification").modal("show");
	});

	$("#forfeitDone").click(function() {
		client.call('forfeit');
	});

	$("#drawGame").click(function() {
		$("#drawNotification").modal("show");
	});

	$("#acceptDraw").click(function() {
		client.call('draw_respond', true);
	});

	$("#refuseDraw").click(function() {
		client.call('draw_respond', false);
	});

	$(".goToMain").click(function() {
		state.go('room', {room: 'lobby'});
		$(".statNotification").modal("hide");
	});

	$("#sendDraw").click(function () {
		client.call('draw');
	});

	client.socket.on('drawing', function(){
		$("#drawRequestNotification").modal("show");
	});

	client.socket.on('endgame', function(data){
		console.log(data);
		if(data.reason === 'forfeit') {
			$("#forfitNotification").modal("hide");
			if(data.result == 'win')
				$("#winNotification").modal("show");
			else
				$("#lossNotification").modal("show");
		} else if(data.result === 'draw') {
			$("#drawNotification").modal("hide");
			$("#drawRequestNotification").modal("hide");
			$("#drawFinalNotification").modal("show");
		} else {
			if(data.result == 'win')
				$("#winNotification").modal("show");
			else
				$("#lossNotification").modal("show");
		}
	});

}

function leave(){

	boardUi.reset();


	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();

}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
