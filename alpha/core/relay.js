(function () {
	'use strict';

	var registry;

	var relay = {
		importRegistry: function(registryInput) {
			registry = registryInput;
		},
		sendMessage: function(data, fromId) {
			if (!registry.get(fromId)) {
				return "You are not registered. You are not allowed to send messages";
			}
			if (!registry.get(data.to)) {
				return "Receiver id is invalid";
			}

			data.from = registry.get(fromId).name;
			data.fromId = fromId;
			registry.get(data.to).send(data);
		},
	};

	module.exports = relay;
})();
