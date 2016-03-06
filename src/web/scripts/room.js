var page;

var roomName;

var playerNameCookie = "playerName";
var playerLevelCookie = "playerLevel";

function load(router){
	page = $('#player-creation');


	var opName = "";
	var opLevel = "";
	var thisPlayer = "";
	var opID = "";

	var cookies = document.cookie.split(';');

	function printToTable(element, index, array) {
		var extraInfo = "";
		if (element.name != $('#playerName').val()) {
			$("#playerTableBody").append("<tr class='player'><td class='opName' data-opID='" + element.id + "'>" + element.name + "</td><td class='opLevel'>" + element.level + "</td></tr>");
		} else if(array.length == 1) {
			if (roomName != "lobby") {
				extraInfo = "Hang in there for your friends or <a href='/r/lobby' id='exitLink'>click here</a> to go to the main lobby.";
			}
			$("#playerTableBody").append("<tr><td colspan='2' class='text-center disabled'><img src='https://orig11.deviantart.net/dcab/f/2011/158/1/6/nyan_cat_by_valcreon-d3iapfh.gif' style='height: 7em; opacity: 0.4; padding-right: 5em;'><br>Sorry!  There are no available players available at this time.  " + extraInfo + "<br></td></tr>");
		} // https://49.media.tumblr.com/8210fd413c5ce209678ef82d65731443/tumblr_mjphnqLpNy1s5jjtzo1_400.gif
	}

	client.socket.on('userlist', function(data){
		$("#playerTableBody").html("");
		data.forEach(printToTable);
	});

	function setCookie(cname, cvalue, exdays) {
		if(typeof(Storage) !== "undefined") {
			localStorage.setItem(cname, cvalue);
		} else {
			// Sorry! No Web Storage support..
		}
	}


	$('#btnChooseOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').val() !== "Choose your experience...") {
			client.call('join', {room: roomName, name: $('#playerName').val(), level: $('#experience').val()}, function(err, data){
				if(err) {
					switch(err) {
						case "user_taken":
							$("#playerProblems").html("Someone else is currently using that name!  Please enter another name.");
							$("#playerProblems").fadeIn();
							break;
					}
				} else {
					setCookie(playerNameCookie, $("#playerName").val(), 30);
					setCookie(playerLevelCookie, document.getElementById("experience").selectedIndex, 30);
					$("#playerProblems").html("");
					$("#playerProblems").hide();
					thisPlayer = $('#playerName').val();
					//console.log( $('#experience').val());
					$('#playerList').show();
					$("#playerTableBody").html("");
					data.forEach(printToTable);
				}
			});
		} else {
			$("#playerProblems").html("Please enter your name and choose your difficulty!");
			$("#playerProblems").fadeIn();
			//alert('Please enter your name and choose your difficulty!');
		}
	});

	$('#btnRandomOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').val() !== "Choose your experience...") {
			client.call('join', {room: roomName, name: $('#playerName').val(), level: $('#experience').val()}, function(err, data){
				if(err) {
					switch(err) {
						case "user_taken":
							$("#playerProblems").html("Someone else is currently using that name!  Please enter another name.");
							$("#playerProblems").fadeIn();
							break;
					}
				} else {
					setCookie(playerNameCookie, $("#playerName").val(), 30);
					setCookie(playerLevelCookie, document.getElementById("experience").selectedIndex, 30);
					$("#playerProblems").html("");
					$("#playerProblems").hide();
					$('#loadingPlayer').modal();
					thisPlayer = $('#playerName').val();
					client.call('challenge', {player_id: 'random'}, function (err, game) {
						//console.log(err, game);
						// TODO: Handle error
						$("#loadingPlayer").modal("hide");
						if (err) {
							//console.log(err);
						} else {
							$("#player-creation").modal("hide");
							router.go('game', {opName: null, opLevel: null, thisPlayer: thisPlayer, data: game});
						}
					});
				}
			});
		} else {
			$("#playerProblems").html("Please enter your name and choose your difficulty!");
			$("#playerProblems").fadeIn();
			//alert('Please enter your name and choose your difficulty!');
		}
	});

	$("#challengeAccepted").click(function(){
		$("#challengeNotification").modal("hide");
		client.call('accept', {player_id : opID}, function(err, game){
			// TODO: Handle error
			router.go('game', { opName: opName, opLevel: opLevel, thisPlayer: thisPlayer, data: game });
		});
	});


	$("#challengedDenied").click(function(){
		$("#challengeNotification").modal("hide");
		client.call('refuse', {}, function()  {
		});
	});

	$("#joinGameBack").click(function(){
		router.go('home');
	});

	$('#exitLink').click(function(e){
		e.preventDefault();
		router.go('home');
	});

	client.socket.on('challenged', function(data) {
		//console.log(data);
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
		//console.log(opID);

		$("#loadingPlayer").modal({ backdrop: 'static' });

		client.call('challenge', {player_id : opID}, function(err, game) {
			//console.log(err, game);
			// TODO: Handle error

			$("#loadingPlayer").modal("hide");
			if(err) {
				console.log(err);
				if (err.reason == "refused") {
					$("#playerRequestDenied").modal("show");
				} else if (err.reason == "timeout") {
					$("#playerRequestTO").modal("show");
				}
			} else {
				$("#player-creation").modal("hide");
				router.go('game', { opName: opName, opLevel: opLevel, thisPlayer: thisPlayer, data: game });
			}
		});
	});
}

function enter(state){

	roomName = state.params.room;


	var cookies = document.cookie.split(';');

	function getAndSetFromCookie(cookie, cookieVal) {
		if(typeof(Storage) !== "undefined") {
			return localStorage.getItem(cookieVal);
		} else {
			return "";
			// Sorry! No Web Storage support..
		}
	}

	$("#playerList").hide();
	$("#playerProblems").hide();
	$('#playerName').attr("value", '');
	$('#experience').prop('selectedIndex',0);

	if(state.params.room == 'lobby')
		$(".roomName").html('the lobby');
	else
		$(".roomName").html(state.params.room);

	page.modal('show');

	var nameFromCookie = getAndSetFromCookie(cookies, playerNameCookie);
	if(nameFromCookie !== "") {
		$("#playerName").attr("value", nameFromCookie);
	}

	var levelFromCookie = getAndSetFromCookie(cookies, playerLevelCookie);
	if(levelFromCookie !== "") {
		document.getElementById("experience").selectedIndex = parseInt(levelFromCookie);
	}
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
