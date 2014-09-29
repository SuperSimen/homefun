var app = angular.module('app', ['ui.router']);

(function() {
	'use strict';

	app.controller('appController', function($scope, $state) {
		$scope.goTo = function(state) {
			$state.go(state);
		};
		$scope.isActive = function(state) {
			return state === $state.current.name;
		};
	});


	app.config( function ( $stateProvider) {
		$stateProvider.state('player', {
			controller: "playerController",
			templateUrl: "views/player/playerView.tpl.html"
		}).state('welcome', {
			controller: "welcomeController",
			templateUrl: "views/welcome/welcomeView.tpl.html"
		});
	});

	app.run( function (socket, $state, player, welcome) {
		socket.init(function() {
			//socket.register();
			welcome.init();
			player.init();
		});
		$state.go("welcome");
	});

	app.factory('constants', function() {
		return {
			networkName: "homefun",
			className: "webClient",
			webSocketUrl: "ws://owesen-lein:10012",
		};

	});


	app.factory('socket', function(constants) {
		var webSocket;

		var socket = {
			init: function(callback) {
				webSocket = new WebSocket(constants.webSocketUrl);

				webSocket.onmessage = function(event) {
					messageHandlers.mainHandler(event.data);
				};

				webSocket.onopen = callback;
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

		socket.register = function(name) {
			var temp = {
				type: "register",
				networkName: constants.networkName,
				className: constants.className,
				name: name
			};
			send(temp);
		};

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

		return socket;
	});

})();
