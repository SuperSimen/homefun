(function() {
	'use strict';

	app.factory('player', function(socket) {
		var player = {
			init: function() {
				socket.addHandler(messageHandler, "presence");
			}
		};

		function messageHandler(data) {
			console.log("received message");
			console.log(data);
		}

		return player;

	});

	app.controller('playerController', function() {

	});
})();
