(function () {
	'use strict';

	var registry = require('./registry.js');

	var net = require('net');
	var socketServer = net.createServer(function (socket) {
		socket.setEncoding('utf8');

		var sessionObject = createSessionObject(
			function(object) {
				socket.write(JSON.stringify(object) + "\n");
			},
			function() {
				socket.end();
			},
			socket.remoteAddress,
			socket.remotePort
		);

		socket.on('data', function(data) {
			var dataArray = data.split("\n");
			var temp;
			console.log(dataArray);
			for (var d = 0; d < dataArray.length; d++) {
				console.log(d);
				try {
					temp = JSON.parse(dataArray[d]);
					onIncomingData(temp, sessionObject);
				}
				catch (e) {}
			}
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
				webSocket.send(JSON.stringify(object) + "\n");
			},
			function() {
				webSocket.close();
			},
			webSocket._socket.remoteAddress,
			webSocket._socket.remotePort
		);
		
		webSocket.on('message', function(data) {
			onIncomingData(JSON.parse(data), sessionObject);
		});
	});

	var protocol = {
		REGISTER: "register",
		UNREGISTER: "unregister",
		MESSAGE: "message",
		BROADCAST: "broadcast",
		PUBLISH: "publish",
		SUBSCRIBE: "subscribe",
		REPLY: "reply",
	};

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

	function onIncomingData (data, sessionObject) {
		console.log(data);
		var reply = {
			type: protocol.REPLY,
		};

		function replyMessage(type, failed, errorMessage) {
			var reply;
			if (failed) {
				reply = type + " failed";
				if (errorMessage) {
					reply += ": " + errorMessage;
				}
			}
			else {
				reply = type + " received";
			}

			return reply;
		}

		var error;
		if (data.type === protocol.REGISTER) {
			if (data.networkName && data.className) {
				error = registry.register(sessionObject, data.networkName, data.className);
				reply.message = replyMessage("Register", error, error);
			}
			else {
				reply.message = replyMessage("Register", true);
			}
		}
		else if (data.type === protocol.UNREGISTER) {
			error = registry.deregister(sessionObject);
			reply.message = replyMessage("Unregister", error, error);

		}
		else if (data.type === protocol.MESSAGE) {
			if (data.message && data.to) {
				reply.message = replyMessage("Register", false);
			}
			else {
				reply.message = replyMessage("Register", true);
			}

		}
		else if (data.type === protocol.BROADCAST) {
			if (data.message) {
				reply.message = replyMessage("Broadcast", false);
			}
			else {
				reply.message = replyMessage("Broadcast", true);
			}

		}
		else if (data.type === protocol.PUBLISH) {
			if (data.message) {
				reply.message = replyMessage("Publish", false);
			}
			else {
				reply.message = replyMessage("Publish", true);
			}

		}
		else if (data.type === protocol.SUBSCRIBE) {
			if (data.to) {
				reply.message = replyMessage("Subscribe", false);
			}
			else {
				reply.message = replyMessage("Subscribe", true);
			}

		}

		console.log(reply.message);
		sessionObject.send(reply);
	}


})();
