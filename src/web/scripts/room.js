var page;

var roomName;

function load(router){
	page = $('#player-creation');
	$("#playerProblems").hide();

	var opName = "";
	var opLevel = "";
	var thisPlayer = "";
	var opID = "";

	function printToTable(element, index, array) {
		if (element.name != $('#playerName').val()) {
			$("#playerTableBody").append("<tr class='player'><td class='opName' data-opID='" + element.id + "'>" + element.name + "</td><td class='opLevel'>" + element.level + "</td></tr>");
		} else if(array.length == 1) {
			$("#playerTableBody").append("<tr><td colspan='2' class='text-center disabled'><img src='https://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' style='height: 150px; opacity: 0.4; padding-right: 100px;'><br>Sorry!  There are no available players available at this time.  Hang in there for your friends or <a href='/r/lobby' id='exitLink'>click here</a> to go to the main lobby.<br></td></tr>");
		} // https://49.media.tumblr.com/8210fd413c5ce209678ef82d65731443/tumblr_mjphnqLpNy1s5jjtzo1_400.gif
	}

	client.socket.on('userlist', function(data){
		$("#playerTableBody").html("");
		data.forEach(printToTable);
	});


	$('#btnChooseOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').val() !== "Chose your experience...") {
			$("#playerProblems").html("");
			$("#playerProblems").hide();
			thisPlayer = $('#playerName').val();
			console.log( $('#experience').val());
			$('#playerList').collapse();
			client.call('join', {room: roomName, name: $('#playerName').val(), level: $('#experience').val()}, function(err, data){
				$("#playerTableBody").html("");
				data.forEach(printToTable);
			});
		} else {
			$("#playerProblems").html("Please enter your name and choose your difficulty!");
			$("#playerProblems").fadeIn();
			//alert('Please enter your name and choose your difficulty!');
		}
	});

	$('#btnRandomOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').val() !== "Choose your experience...") {
			$("#playerProblems").html("");
			$("#playerProblems").hide();
			$('#loadingPlayer').modal({ backdrop: 'static' });
		} else {
			$("#playerProblems").html("Please enter your name and choose your difficulty!");
			$("#playerProblems").fadeIn();
			//alert('Please enter your name and choose your difficulty!');
		}
	});

	$("#challengeAccepted").click(function(){
		$("#challengeNotification").modal("hide");
		client.call('accept', {player_id : opID}, function(err, game){

		});
		router.go('game', { opName: opName, opLevel: opLevel, thisPlayer: thisPlayer });
	});

	$("#joinGameBack").click(function(){
		$("#player-creation").modal("hide");
		$("#playerList").hide();
	});

	$("#challengedDenied").click(function(){
		$("#challengeNotification").modal("hide");
	});

	$("#joinGameBack").click(function(){
		router.go('home');
	});

	$('#exitLink').click(function(e){
		e.preventDefault();
		router.go('home');
	});

	client.socket.on('challenged', function(data) {
		console.log(data);
		$("#challengeNotification").modal("show");
		$(".requestPlayerName").html(data.player.name);
		$(".requestPlayerSkill").html(data.player.level);
		opName = data.player.name;
		opLevel = data.player.level;
	});


	$('#availPlayerTable').on("click", "tr.player", function() {
		opName = $(this).find(".opName").html();
		opLevel = $(this).find(".opLevel").html();
		opID = $(this).find(".opName").data("opid");
		console.log(opID);

		$("#loadingPlayer").modal({ backdrop: 'static' });

		client.call('challenge', {player_id : opID}, function(data) {
			$("#loadingPlayer").modal("hide");
			$("#player-creation").modal("hide");
			router.go('game', { opName: opName, opLevel: opLevel, thisPlayer: thisPlayer });
		});
		/*
			$("#loadingPlayer").modal("hide");


		*/
	});
}

function enter(state){

	roomName = state.params.room;


	$('#playerName').val('');
	$('#experience').prop('selectedIndex',0);

	if(state.params.room == 'lobby')
		$(".roomName").html('the lobby');
	else
		$(".roomName").html(state.params.room);

	page.modal('show');
}

function leave(){
	client.call('leave', {room: roomName}, function(err){

	});

	page.modal('hide');
}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
