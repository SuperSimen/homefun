(function() {
	'use strict';

	var configModule = angular.module('config', []);

	configModule.factory('config', function() {
		var config = {};

		config.coralServer = {
			ip: "192.168.1.130",
			socketPort: "10011",
			webSocketPort: "10012",
			sslWebSocketPort: "10013",

			getWebSocket: function() {
				var webSocket = "ws://" + this.ip + ":" + this.webSocketPort;
				console.log(webSocket);
				return webSocket;
			},
		};

		return config;

	});

})();
