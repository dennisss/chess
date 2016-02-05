var page;

var roomName;

function load(router){
	page = $('#player-creation')

	var opName = "";
	var opLevel = "";
	var thisPlayer = "";


	function printToTable(element, index, array) {
		if (element.name != $('#playerName').val()) {
			$("#playerTableBody").append("<tr><td class='opName'>" + element.name + "</td><td class='opLevel'>" + element.level + "</td></tr>");
		}
	}

	client.socket.on('userlist', function(data){
		$("#playerTableBody").html("");
		data.forEach(printToTable);
	});


	$('#btnChooseOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').val() !== "Chose your experience...") {
			thisPlayer = $('#playerName').val();
			console.log( $('#experience').val());
			$('#playerList').collapse();
			client.proc.call('join', {room: roomName, name: $('#playerName').val(), level: $('#experience').val()}, function(err, data){
				$("#playerTableBody").html("");
				data.forEach(printToTable);
			});
		} else {
			alert('Please enter your name and choose your difficulty!');
		}
	});

	$('#btnRandomOp').click(function(){
		if ($('#playerName').val().length > 0& $('#experience').val() !== "Choose your experience...") {
			$('#loadingPlayer').modal({ backdrop: 'static' });
		} else {
			alert('Please enter your name and choose your difficulty!');
		}
	});



	$("#joinGameBack").click(function(){
		router.go('home');
	});

	$('#exitLink').click(function(e){
		e.preventDefault();
		router.go('home');
	});



	$('#availPlayerTable').on("click", "tr", function() {
		opName = $(this).find(".opName").html();
		opLevel = $(this).find(".opLevel").html();
		$("#loadingPlayer").modal({ backdrop: 'static' });
		setTimeout(function() {
			$("#loadingPlayer").modal("hide");

			router.go('game', { opName: opName, opLevel: opLevel, thisPlayer: thisPlayer });

		}, 5000);
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
	client.proc.call('leave', {room: roomName}, function(err){

	});

	page.modal('hide');
}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};
