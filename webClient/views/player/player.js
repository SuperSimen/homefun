(function() {
	'use strict';

	app.factory('player', function(coral, $rootScope, $state, $sce) {
		var player = {
			init: function() {
				coral.on("message", messageHandler);
				$rootScope.player = {};
				$rootScope.$watch(
					function() {return $rootScope.player.source;},
					function(newValue) {
						if (newValue) {
							$state.go("player", {}, {reload: true});
						}
						else {
							$state.go("welcome");
						}
					}
				);
			}
		};

		function messageHandler(data) {
			var command = data.message;
			var reply = {
				type: 'command-reply',
				command: command.type,
			};
			if (!command.type) {
				reply.error = 'invalid message';
			}
			else if (command.type === 'load') {
				if ($rootScope.player.master) {
					reply.error = "I'm already taken";
				}
				else if (command.path) {
					$rootScope.player.source = $sce.trustAsResourceUrl(command.path);
					$rootScope.player.title = command.title;
					$rootScope.player.master = data.fromId;

					reply.title = command.title;
				}
				else {
					reply.error = "Cannot complete load command";
				}
			}
			else if ($rootScope.player.master !== data.fromId) {
				reply.error = 'you cannot control me';
			}
			else if (command.type === "play") {

			}
			else if (command.type === 'pause') {

			}
			else if (command.type === "stop") {
				$rootScope.player.source = "";
				$rootScope.player.title = "";
				$rootScope.player.master = "";
				$rootScope.player.currentTime = 0;
				$rootScope.player.duration = 0;
				$rootScope.player.goToTime = 0;
			}
			else if (command.type === "go-to") {
				$rootScope.player.goToTime = command.goToTime;
			}
			else {
				reply.error = 'unrecognized command';
			}

			if (!reply.error) {
				$rootScope.$apply(function() {
					$rootScope.player.command = command.type;
				});
			}

			coral.sendMessage(data.fromId, reply);
		}

		return player;

	});

	app.directive("hfControl", function($timeout, $state) { 
		function link (scope, element, attrs) {
			scope.$watch(
				function() {return scope.control.command;},
				function(command) {
					if (command === 'play') {
						element[0].play();
					}
					else if (command === 'pause') {
						element[0].pause();
					}
				}
			);

			scope.$watch(
				function() {return scope.control.goToTime;},
				function(time) {
					console.log('going-to-time');
					if (time >= 0) {
						element[0].currentTime = time;
					}
				}
			);

			element[0].addEventListener('loadedmetadata', updateCurrentTime);

			function updateCurrentTime () {
				if ($state.current.name === 'player') {
					scope.$apply(function() {
						scope.control.currentTime = element[0].currentTime;
						if (scope.control.duration !== element[0].duration) {
							scope.control.duration = element[0].duration;
						}
					});

					$timeout(updateCurrentTime, 500);
				}
			}
		}

		return {
			link: link,
			scope: {
				control: '='
			}
		};
	});

	app.directive("hfVideoResize", function() {
		
		var e = null;
		
		function resize() {
			
			var max_scale = Math.min(
				window.innerWidth / e.videoWidth, 
				window.innerHeight / e.videoHeight
			);

			e.style.width = e.width = max_scale * e.videoWidth;
			e.style.width = e.height = max_scale * e.videoHeight;
		}
		
		return {
			compile: function(element) {
				e = element[0];
				window.addEventListener('resize', resize);
				e.addEventListener('loadedmetadata', resize);
			},
			link: function(scope, element) {
				scope.on('$destroy', function() {
					element[0].removeEventListener('resize', resize);
				});
			}
		};
	});

	app.controller('playerController', function($scope, coral) {
		$scope.$watch(
			function() {return $scope.player.currentTime;},
			function(currentTime) {
				var timeUpdate = {
					currentTime: currentTime,
					duration: $scope.player.duration,
					type: 'time-update'
				};
				coral.sendMessage($scope.player.master, timeUpdate);
			}
		);
	});
})();
