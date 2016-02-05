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
		} else if(array.length == 1) {
			$("#playerTableBody").append("<tr><td colspan='2' class='text-center'><img src='https://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' style='height: 150px'><br>Sorry!  There are no available players available at this time.  Hang in there!<br></td></tr>");
		} // https://49.media.tumblr.com/8210fd413c5ce209678ef82d65731443/tumblr_mjphnqLpNy1s5jjtzo1_400.gif
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
