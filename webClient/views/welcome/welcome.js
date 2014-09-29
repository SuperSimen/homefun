(function() {
	'use strict';
	app.factory('welcome', function($rootScope) {
		var welcome = {
			init: function() {
				$rootScope.values = {
					isNameSet: false,
				};
			}
		};

		return welcome;

	});

	app.controller('welcomeController', function(socket, $rootScope, $scope) {


		$scope.nameKeyDown = function(event) {
			if (event.keyCode === 13 && $scope.values.name) {
				$scope.values.isNameSet = true;
				socket.register($scope.values.name);
			}
		};
	});


})();
