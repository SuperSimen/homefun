(function() {
	'use strict';

	app.controller('deviceController', function($scope, devices) {
		$scope.devices = devices.list;
	});
})();
