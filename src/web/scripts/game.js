var Chess = require('../../chess'),
	BoardUi = require('./boardUi');

var game, boardUi;

function load(router){

	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();
	$("#drawGame").hide();
	$("#forfeitGame").hide();


	boardUi = new BoardUi($('.chessboard'));



	boardUi.on('move', function(move, callback){
		client.call('move', move, function(err){
			callback(err);
		});
	});


	client.socket.on('moved', function(data){
		var move = new Chess.Move(data);

		boardUi.processMove(move);
	})

}

function enter(state){

	if(!state.params.hasOwnProperty('data')){
		state.go('home');
		return;
	}


	game = new Chess.Game(state.params.data);


	// Figure out which color the current client is
	var me = client.socket.id == game.white_player.id ? Chess.Color.White : Chess.Color.Black;

	boardUi.start(game.board, me);


	var thisPlayer = state.params.thisPlayer;
	var opName = state.params.opName;

	$(".thisPlayerName").html(thisPlayer);
	$(".otherPlayerName").html(opName);
	$("#thisPlayerInfo").show();
	$("#thatPlayerInfo").show();

	$("#forfeitGame").show();
	$("#drawGame").show();

	$("#actionMenu").click(function() {
		if ($(this).hasClass('clicked')) {
			$(this).removeClass('clicked');
			$('#forfeitGame, #drawGame').hide();
			$("#forfeitGame, #drawGame").css({
				bottom: "5px", right: 0, margin: "5px", position: "fixed"
			});
		}
		else {
			$(this).addClass('clicked');
			$('#forfeitGame, #drawGame').show().css({
				'opacity': 0,
				'transform': 'scale(0.7)'
			});
			$("#forfeitGame").animate({
				opacity: '1',
				bottom: "105px",
				right: 0,
				margin: "5px",
				position: "fixed"
			}, 500);
			$("#drawGame").animate({
				opacity: '1',
				bottom: "55px",
				right: 0,
				margin: "5px",
				position: "fixed"
			}, 500);
		}
	});

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
