(function() {
	'use strict';

	app.factory('player', function(socket, $rootScope, $state, $sce) {
		var player = {
			init: function() {
				socket.addHandler(messageHandler, "message");
				$rootScope.$watch(
					function() {return $rootScope.playing;},
					function(newValue) {
						console.log(newValue);
						if (newValue) {
							$state.go("player", {}, {reload: true});
						}
						else {
							$state.go("welcome");
						}
					},
					true
				);
			}
		};

		function messageHandler(data) {
			var command = data.message;
			if (!command.type) {
				return console.log("invalid message");
			}
			else if (command.type === "play") {
				$rootScope.$apply(function() {
					$rootScope.playing = {
						title: command.title,
						path: $sce.trustAsResourceUrl(command.path),
					};
				});
				socket.sendMessage({status: "playing"}, data.fromId);
			}
			else if (command.type === "stop") {
				$rootScope.$apply(function() {
					$rootScope.playing = null;
				});
				socket.sendMessage({status: "stopped"}, data.fromId);
			}
			else {
				console.log("unrecognized message type");
			}
		}

		return player;

	});

	app.controller('playerController', function($scope) {
	});
})();
