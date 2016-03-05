/**
 * Created by Dan on 3/5/2016.
 */

client.socket.on("disconnect", function () {
	$("#disconnectWarning").modal("show");
});

client.socket.on("reconnect", function () {
	location.reload();
});