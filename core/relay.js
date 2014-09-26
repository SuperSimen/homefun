(function () {
	'use strict';

	var registry;


	var relay = {
		importRegistry: function(registryInput) {
			registry = registryInput;
		},
		sendMessage: function(data, fromId) {
			if (!registry.get(fromId)) {
				return "Not registered. Not allowed to send messages";
			}
			if (!registry.get(data.to)) {
				return "Receiver id is invalid";
			}

			data.from = registry.get(fromId).name;
			data.fromId = fromId;
			data.className = registry.get(fromId).className;
			registry.get(data.to).send(data);
		},
		broadcast: function(data, fromId) {
			if (!registry.get(fromId)) {
				return "Not registered. Not allowed to broadcast";
			}

			var from = registry.get(fromId);

			data.from = from.name;
			data.fromId = fromId;
			data.className = registry.get(fromId).className;

			var components = registry.getNetwork(from.networkName).getComponents();

			for (var i in components) {
				registry.get(components[i]).send(data);
			} 
		},
		publish: function(data, fromId) {
			var component = registry.get(fromId);
			if (!component) {
				return "Not registered. Not allowed to send messages";
			}

			data.from = component.name;
			data.fromId = fromId;
			data.className = component.className;

			var network = registry.getNetwork(component.networkName);

			network.subscribers.broadcastPublishMessage(data);
			network.getClass(component.className).subscribers.broadcastPublishMessage(data);
		},
	};


	module.exports = relay;
})();
