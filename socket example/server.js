(function () {
	'use strict';

	var net = require('net');
	var socketServer = net.createServer(function (socket) {
		socket.setEncoding('utf8');
		socket.on('data', function(data) {
			onIncomingData(data);
		});
	});

	socketServer.listen(10011, function() {
		var address = socketServer.address();
		console.log("Listening on port ", address.port);
	});

	var WebSocketServer = require('ws').Server;
	var webSocketServer = new WebSocketServer({port: 10012});

	webSocketServer.on('connection', function(webSocket) {
		webSocket.on('message', function(data) {
			onIncomingData(data);
		});
	});

	function onIncomingData (data) {
		console.log(data);
	}

})();
