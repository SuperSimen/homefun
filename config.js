(function() {
	'use strict';

	var configModule = angular.module('config', []);

	configModule.factory('config', function() {
		var config = {};

		config.coralServer = "ws://192.168.1.130:10012";

		return config;

	});

})();
