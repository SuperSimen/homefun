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

	app.directive("ngVideoResize", function() {
		
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

})();
