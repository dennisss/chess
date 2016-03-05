/**
 * Created by Dan on 3/5/2016.
 */

client.socket.on("disconnect", function () {
	$(".modal").modal("hide");
	$("#disconnectWarning").modal("show");
});

client.socket.on("reconnect", function () {
	setTimeout( function() {
		location.reload();
	}, 2000);
});