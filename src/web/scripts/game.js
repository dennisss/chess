
function load(router){

	$("#thisPlayerInfo").hide();
	$("#thatPlayerInfo").hide();



}

function enter(state){

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
