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
			if(err === null) {
				$("#waitingTurn").modal("show");
			}
		});

	});

	boardUi.on('chooseMove', function(data, callback){
		$("#promotionSelection").modal("show");
		var moves = data;

		$("#promoteQueen").click(function(){
			var m = moves.filter(function( obj ) {
				return obj.type === (Chess.Type.Promotion | Chess.Type.Queen);
			})[0];
			$("#promotionSelection").modal("hide");
			callback(m);
		});

		$("#promoteBishop").click(function(){
			var m = moves.filter(function( obj ) {
				return obj.type === (Chess.Type.Promotion | Chess.Type.Bishop);
			})[0];
			$("#promotionSelection").modal("hide");
			callback(m);
		});

		$("#promoteKnight").click(function(){
			var m = moves.filter(function( obj ) {
				return obj.type === (Chess.Type.Promotion | Chess.Type.Knight);
			})[0];
			$("#promotionSelection").modal("hide");
			callback(m);
		});

		$("#promoteRook").click(function(){
			var m = moves.filter(function( obj ) {
				return obj.type === (Chess.Type.Promotion | Chess.Type.Rook);
			})[0];
			$("#promotionSelection").modal("hide");
			callback(m);
		});

	});


	client.socket.on('moved', function(data){
		var move = new Chess.Move(data);
		$("#waitingTurn").modal("hide");
		boardUi.processMove(move);
	})

}

function enter(state){

	if(!state.params.hasOwnProperty('data')){
		state.go('home');
		return;
	}


	game = new Chess.Game(state.params.data);
	//console.log(game);

	var thisPlayer = "";
	var opName = "";

	// Figure out which color the current client is
	var me = client.socket.id == game.white_player.id ? Chess.Color.White : Chess.Color.Black;
	var op ;
	if (me == Chess.Color.White) {
		thisPlayer = game.white_player.name;
		op = Chess.Color.Black;
		opName = game.black_player.name;
	} else {
		thisPlayer = game.black_player.name;
		op = Chess.Color.White;
		opName = game.white_player.name;
	}

	if (!(me == game.board.turn)) {
		$("#waitingTurn").modal("show");
	} else {
		$("#startGame").modal("show");
	}

	boardUi.start(game.board, me);

	//console.log("playerNames: " + thisPlayer + " " + opName);

	$(".thisPlayerName").html(thisPlayer);
	$(".otherPlayerName").html(opName);
	$("#thisPlayerInfo").show();
	$("#thatPlayerInfo").show();
	$("#thisPlayerInfoName").show();

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
		client.call('draw_respond', {answer: true});
	});

	$("#refuseDraw").click(function() {
		client.call('draw_respond', {answer: false});
	});

	$(".goToMain").click(function() {
		state.go('room', {room: 'lobby'});
		$(".statNotification").modal("hide");
	});

	$("#sendDraw").click(function () {
		client.call('draw', {}, function(err, data){
			var agreed = data.answer;
			if(!agreed){
				alert('The other person does not want a draw')
			}
		});
		$("#drawNotification").modal("hide");
		$("#loadingPlayer").modal("show");
	});

	client.socket.on('drawing', function(){
		$("#drawRequestNotification").modal("show");
	});

	client.socket.on('endgame', function(data){
		//console.log(data);
		$("#waitingTurn").modal("hide");
		$("#reasonWon").html("");
		if(data.reason === 'forfeit') {
			$("#forfitNotification").modal("hide");
			if(data.result == 'win') {
				$("#reasonWon").html("Your opponent forfeit.");
				$("#winNotification").modal("show");
			}
			else
				$("#lossNotification").modal("show");
		} else if(data.result === 'draw') {
			$("#loadingPlayer").modal("hide");
			$("#drawRequestNotification").modal("hide");
			$("#drawFinalNotification").modal("show");
		} else {
			if(data.result == 'win') {
				if(data.reason === "disconnect") {
					$("#reasonWon").html("Your opponent disconnected from the game.");
				}
				$("#winNotification").modal("show");
			}
			else
				$("#lossNotification").modal("show");
		}
	});

}

function leave(){

	boardUi.reset();


	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();
	$("#thisPlayerInfoName").hide();

}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
