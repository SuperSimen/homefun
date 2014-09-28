(function() {
	'use strict';
	app.factory('welcome', function() {
		var welcome = {

		};

		welcome.setName = function(name) {
			console.log("setting name");
			console.log(name);
		};

		return welcome;

	});

	app.controller('welcomeController', function(socket, $scope) {
		$scope.isNameSet = false;

		$scope.nameKeyDown = function(event) {
			if (event.keyCode === 13 && $scope.name) {
				$scope.isNameSet = true;
				socket.register($scope.name);
			}
		};
	});
})();
