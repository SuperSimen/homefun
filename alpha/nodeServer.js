(function () {
	'use strict';

	var net = require('net');
	var socketServer = net.createServer(function (socket) {
		socket.setEncoding('utf8');

		var sessionObject = createSessionObject(
			function(object) {
				socket.write(JSON.stringify(object));
			},
			function() {
				socket.end();
			},
			socket.remoteAddress,
			socket.remotePort
		);

		socket.on('data', function(data) {
			onIncomingData(JSON.parse(data), sessionObject);
		});
	});

	socketServer.listen(10011, function() {
		var address = socketServer.address();
	});

	var WebSocketServer = require('ws').Server;
	var webSocketServer = new WebSocketServer({port: 10012});

	webSocketServer.on('connection', function(webSocket) {

		var sessionObject = createSessionObject(
			function(object) {
				webSocket.send(JSON.stringify(object));
			},
			function() {
				webSocket.close();
			},
			webSocket._socket.remoteAddress,
			webSocket._socket.remotePort
		);
		
		webSocket.on('message', function(data) {
			onIncomingData(data, sessionObject);
		});
	});

	function onIncomingData (data, sessionObject) {
		console.log(data);
		console.log(sessionObject);
		var message = {data: "reply from server"};
		sessionObject.send(message);
		sessionObject.close();
	}

	function createSessionObject (sendInput, closeInput, remoteAddressInput, remotePortInput) {

		var sessionObject = {
			send: sendInput,
			close: closeInput,
			remoteAddress: remoteAddressInput,
			remotePort: remotePortInput,
			getId: function() {
				return this.remoteAddress + ":" + this.remotePort;
			}
		};

		return sessionObject;
	}

	var connections = {
		list: {},
		register: function(sessionObject) {
			if (this.list[sessionObject.getId()]) {
				console.error("register impossible, id not unique");
			}
			else {
				this.list[sessionObject.getId()] = sessionObject;
			}
		},
		deregister: function(sessionObject) {
			if (this.list[sessionObject.getId()]) {
				delete this.list[sessionObject.getId()];
			}
			else {
				console.error("unregister impossible, id not found");
			}
		},
		get: function(id) {
			if (this.list[id]) {
				return this.list[id];
			}
			else {
				console.error("get impossible, id not found");
			}
		}

	};


})();
