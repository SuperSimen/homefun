var app = angular.module('app', ['ui.router']);

(function() {
	'use strict';

	app.controller('appController', function() {

	});

	app.config( function ( $stateProvider) {
		$stateProvider.state('devices', {
			controller: "deviceController",
			templateUrl: "views/devices/deviceView.tpl.html"
		});

	});

	app.run( function (socket, $state, devices) {
		socket.init();
		devices.init();
		$state.go("devices");
	});

	app.factory('constants', function() {
		return {
			networkName: "homefun",
			className: "webController",
			webSocketUrl: "ws://localhost:10012",
		};

	});

	app.factory('devices', function($rootScope, socket) {

		var devices = {
			init: function() {
				socket.addHandler(presenceHandler, "presence");
				socket.addHandler(broadcastHandler, "broadcast");
			},
			list: [],
			fillList: function(list) {
				this.list.length = 0;
				for (var i in list) {
					this.list.push(list[i]);
				}
			},
		};

		function presenceHandler(data) {
			$rootScope.$apply(function() {
				devices.fillList(data.list);
			});
		}

		function broadcastHandler(data) {
			console.log("received broadcast");
			console.log(data);
		}


		return devices;

	});

	

	app.factory('socket', function(constants) {
		var webSocket;

		var socket = {
			init: function() {
				webSocket = new WebSocket(constants.webSocketUrl);

				webSocket.onmessage = function(event) {
					messageHandlers.mainHandler(event.data);
				};

				webSocket.onopen = function() {
					register();
					subscribe();
				};
			}
		};

		var messageHandlers = {
			list: {},
			mainHandler: function(data) {
				var dataArray = data.split("\n");
				var message;
				for (var d = 0; d < dataArray.length; d++) {
					if (dataArray[d].length) {
						var parsingFailed = false;
						try {
							message = JSON.parse(dataArray[d]);
						}
						catch (e) {
							parsingFailed = true;
							console.error("parsing failed");
						}
						if (!parsingFailed) {
							if (message.type && this.list[message.type]) {
								messageHandlers.list[message.type](message);
								return;
							}
							else {
								//console.log(message);
							}
						}
					}
				}
			},

			addHandler: function(handler, type) {
				this.list[type] = handler;
			}
		};

		socket.addHandler = function(handler, type) {
			messageHandlers.addHandler(handler, type);
		};

		function register() {
			var temp = {
				type: "register",
				networkName: constants.networkName,
				className: constants.className,
			};
			send(temp);
		}
		function subscribe() {
			var temp = {
				type: "subscribe",
				subscribeTo: "presence"
			};
			send(temp);
		}

		function send(object) {
			webSocket.send(JSON.stringify(object) + "\n");
		}

		socket.sendMessage = function(message, to) {
			var temp = {
				type: "message",
				message: message,
				to: to,
			};
			send(temp);
		};
		socket.broadcast = function(message) {
			var temp = {
				type: "broadcast",
				message: message
			};
			send(temp);
		};

		return socket;
	});

})();
