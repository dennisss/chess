var page;

var emailMessageLink = "mailto:?subject=Come Play Friendly Chess with Me!&body=Come play chess with me on Friendly Chess! Just go to ";

function load(router){
	page = $('#room-creation');


	var roomName;

	$("#roomName").keyup(function() {
		var value = this.value;
		if(value === "") {
			$("#groupURL").val("");
			$("#shareIcons").fadeOut();
			$("#goRoom").addClass("disabled");
			$("#goRoom").prop("disabled", true);
			roomName = "lobby";
		} else {
			roomName = value;
			var roomUrl = router.link('room', {room: roomName});
			var safeRoomUrl = encodeURIComponent(roomUrl); // For embedding in share links

			$("#groupURL").val(roomUrl);
			$("#fbShareLink").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + safeRoomUrl);
			$("#gPlusShare").attr("href", "https://plus.google.com/share?url=" + safeRoomUrl);
			$("#twitterShare").attr("href", "https://twitter.com/home?status=Play%20Friendly%20Chess%20with%20me!%20%20" + safeRoomUrl);
			$("#emailShare").attr("href", emailMessageLink + safeRoomUrl + " to get started!");
			$("#goRoom").removeClass("disabled");
			$("#goRoom").prop("disabled", false);
			$("#shareIcons").fadeIn();
		}

	});


	$("#goRoom").click(function() {
		router.go('room', {room: roomName})
	});

	document.getElementById("copyRoomUrl").addEventListener("click", function() {
		var success = copyToClipboard(document.getElementById("groupURL"));
		if (success) {
			$('#copyRoomUrl').popover( {placement: "top"} );
		}
	});



	$('#btnBackFromCreation').click(function(){
		router.go('home');
	});

}

function enter(state){

	$("#goRoom").toggleClass("disabled", true);
	$("#goRoom").prop("disabled", true);

	document.getElementById('roomName').value = '';
	document.getElementById('groupURL').value = '';
	$('#shareIcons').hide();

	page.modal('show');
}

function leave(){
	page.modal('hide');

}


module.exports = {
	load: load,
	enter: enter,
	leave: leave
};




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
