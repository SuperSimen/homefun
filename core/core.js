(function () {
	'use strict';

	var protocol = require('./protocol.js');

	var registry = require('./registry.js');
	registry.importProtocol(protocol);

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
			onIncomingData(data, sessionObject);
		});
		socket.on('close', function(data) {
			onClose(sessionObject);
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
			onIncomingData(data, sessionObject);
		});
		webSocket.on('close', function() {
			onClose(sessionObject);
		});
	});

	function onClose(sessionObject) {
		var component = registry.get(sessionObject.getId());
		if (component) {
			registry.deregister(component.id);
		}
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


	function onIncomingData (data, sessionObject) {
		var dataArray = data.split("\n");
		var temp;
		for (var d = 0; d < dataArray.length; d++) {
			if (dataArray[d].length) {
				var parsingFailed = false;
				try {
					temp = JSON.parse(dataArray[d]);
				}
				catch (e) {
					parsingFailed = true;
					sessionObject.send(replyMessage("Parse", true, "Could not parse data, not correct JSON object"));
				}
				if (!parsingFailed) {
					handleData(temp, sessionObject);
				}
			}
		}
	}

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

		return { 
			type: protocol.TYPE.SERVER_ACK,
			value: type,
			message: reply,
		};
	}

	function handleData (data, sessionObject) {

		var reply, error, component = registry.get(sessionObject.getId());
		if (!protocol.isValidData(data)) {
			reply = replyMessage(data.type, true, "Data did not match protocol");
		}
		else if (data.type === protocol.TYPE.REGISTER) {
			error = registry.register(sessionObject, data.networkName, data.className, data.name);
			reply = replyMessage(data.type, error, error);
			reply.yourIp = sessionObject.remoteAddress;
		}
		else if (!registry.get(sessionObject.getId())) {
			reply = replyMessage(data.type, true, "Not authorized");
		}
		else if (data.type === protocol.TYPE.UNREGISTER) {
			error = registry.deregister(sessionObject);
			reply = replyMessage(data.type, error, error);
		}
		else if (data.type === protocol.TYPE.MESSAGE) {
			error = relay.sendMessage(data.message, data.to, sessionObject.getId());
			reply = replyMessage(data.type, error, error);
		}
		else if (data.type === protocol.TYPE.BROADCAST) {
			error = relay.broadcast(data.message, sessionObject.getId());
			reply = replyMessage(data.type, false);
		}
		else if (data.type === protocol.TYPE.PUBLISH) {
			error = relay.publish(data.message, sessionObject.getId());
			reply = replyMessage(data.type, error, error);
		}
		else if (data.type === protocol.TYPE.SUBSCRIBE) {
			error = component.subscribeTo(data.subscribe.to, data.subscribe.value, data.subscribe.type);
			reply = replyMessage(data.type, error, error);
		}
		else {
			reply = replyMessage("Protocol", true, "Unrecognized type");
		}

		sessionObject.send(reply);
	}

	var relay = {
		sendMessage: function(message, toId, fromId) {
			var from = registry.get(fromId);
			if (from) {
				return "Not registered. Not allowed to send messages";
			}
			var to = registry.get(toId);
			if (to) {
				return "Receiver id is invalid";
			}

			var tempMessage = {
				type: protocol.TYPE.MESSAGE,
				from: from.name,
				fromId: fromId,
				className: from.className,
				message: message,
			};

			to.send(tempMessage);
		},
		broadcast: function(message, fromId) {
			var from = registry.get(fromId);
			if (from) {
				return "Not registered. Not allowed to broadcast";
			}

			var broadcastMessage = {
				type: protocol.TYPE.BROADCAST,
				from: from.name,
				fromId: fromId,
				className: from.className,
				message: message,
			};

			registry.getNetwork(from.networkName).broadcast(broadcastMessage);
		},
		publish: function(message, fromId) {
			var from = registry.get(fromId);
			if (!from) {
				return "Not registered. Not allowed to send messages";
			}

			var publishMessage = {
				type: protocol.TYPE.PUBLISH,
				from: from.name,
				fromId: fromId,
				className: from.className,
				message: message,
			};

			var network = registry.getNetwork(from.networkName);

			network.subscribers.broadcastPublishMessage(publishMessage);
			network.getClass(from.className).subscribers.broadcastPublishMessage(publishMessage);

		},
	};


})();
