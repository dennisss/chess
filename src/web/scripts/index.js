var Client = require('../../client');

var Chess = require('../../chess');

/*

Client.socket.on('userlist', function(data){


});

Client.socket.on('gamerequest', function(data){


})

Client.proc.call('join', {room: 'Hello', name: 'Dennis', level: 'Jedi'}, function(err, data){

	console.log(err);

	console.log(data);


})

Client.proc.call('leave', {room: 'Hello'}, function(err){


});

*/


// If the user goes to a room url, this will be populated
var roomName = null;
var m = /^\/r\/(.*)$/.exec(location.pathname);
if(m){
	roomName = m[1];
}



$(function(){

	var siteURL = location.origin;
	var emailMessageLink = "mailto:?subject=Come Play Friendly Chess with Me!&body=Come play chess with me on Friendly Chess! Just go to ";

	$("#shareIcons").hide();
	$.material.init();
	$(function () {
		$('[data-toggle="tooltip"]').tooltip()
	})
	$(window).load(function(){
		$('#first-load-dialog').modal('show');
	});
	$("#roomName").keyup(function() {
		var value = this.value;
		if(value == "") {
			$("#groupURL").val("");
			$("#shareIcons").fadeOut();
			$("goRoom").addClass("disabled");
		} else {
			//value = value.replace(new RegExp(" ", 'g'), "").replace("'", "").replace("/", "").replace("%", "").replace(";", "").replace("<", "").replace(">", "").replace(":", "").replace("[", "").replace("]", "").replace("{", "").replace("}", "").replace("^", "");
			value = value.replace(/([.%*;.<>+?^=!:${}()|\[\]\/\\])/g, "").replace(new RegExp(" ", 'g'), "");
			$("#groupURL").val(siteURL + "/r/" + value);
			$("#fbShareLink").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + siteURL + "/r/" + value);
			$("#gPlusShare").attr("href", "https://plus.google.com/share?url=" + siteURL + "/r/" + value);
			$("#twitterShare").attr("href", "https://twitter.com/home?status=Play%20Friendly%20Chess%20with%20me!%20%20" + siteURL + "/r/" + value);
			$("#emailShare").attr("href", emailMessageLink + siteURL + "/r/" + value + " to get started!");
			$("#goRoom").removeClass("disabled");
			$("#shareIcons").fadeIn();
		}

	});

	document.getElementById("copyRoomUrl").addEventListener("click", function() {
		var success = copyToClipboard(document.getElementById("groupURL"));
		if (success) {
			$('#copyRoomUrl').popover( {placement: "top"} );
		}
	});

	$('#btnChooseOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').selectedIndex !== 0) {
			$('#playerList').collapse();
		} else {
			alert('Please enter your name and choose your difficulty! your name is '+$('#playerName').val()+' and your difficulty index is'+$('#experience').index());
		}
	});

	$('#btnRandomOp').click(function(){
		if ($('#playerName').val().length > 0 && $('#experience').selectedIndex !== 0) {
			$('#loadingPlayer').modal({ backdrop: 'static' });
		} else {
			alert('Please enter your name and choose your difficulty! your name is '+$('#playerName').val()+' and your difficulty index is'+$('#experience').index());
		}
	});

	function copyToClipboard(elem) {
		// create hidden text element, if it doesn't already exist
		var targetId = "_hiddenCopyText_";
		var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
		var origSelectionStart, origSelectionEnd;
		if (isInput) {
			// can just use the original source element for the selection and copy
			target = elem;
			origSelectionStart = elem.selectionStart;
			origSelectionEnd = elem.selectionEnd;
		} else {
			// must use a temporary form element for the selection and copy
			target = document.getElementById(targetId);
			if (!target) {
				var target = document.createElement("textarea");
				target.style.position = "absolute";
				target.style.left = "-9999px";
				target.style.top = "0";
				target.id = targetId;
				document.body.appendChild(target);
			}
			target.textContent = elem.textContent;
		}
		// select the content
		var currentFocus = document.activeElement;
		target.focus();
		target.setSelectionRange(0, target.value.length);

		// copy the selection
		var succeed;
		try {
			succeed = document.execCommand("copy");
		} catch(e) {
			succeed = false;
		}
		// restore original focus
		if (currentFocus && typeof currentFocus.focus === "function") {
			currentFocus.focus();
		}

		if (isInput) {
			// restore prior selection
			elem.setSelectionRange(origSelectionStart, origSelectionEnd);
		} else {
			// clear temporary content
			target.textContent = "";
		}
		return succeed;
	}

	$('#availPlayerTable').on("click", "tr", function() {
		$("#loadingPlayer").modal({ backdrop: 'static' });
	});

});



