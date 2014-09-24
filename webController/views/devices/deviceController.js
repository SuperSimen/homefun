(function() {
	'use strict';

	app.controller('deviceController', function($scope, devices) {
		$scope.devices = devices.list;

		var colorList = {};
		$scope.getColor = function(className) {
			if (!colorList[className]) {
				colorList[className] = Object.keys(colorList).length + 1;
			}
			console.log(colorList);
			return "color-" + colorList[className];
		};
	});
})();
