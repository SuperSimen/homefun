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
			console.log(components);

			for (var i in components) {
				registry.get(components[i]).send(data);
			} 
		}
	};

	function newSubscription() {
		return {
			list: {},
			
			addSubscriber: function (subscriberId) {
				if (!this.list[subscriberId]) {

				}
			},
			subscriptionId: subscriptionId,
		};
	
	}

	var subscriptions = {
		list: {},
		addSubscription: function (subscriptionId, subscriberId) {
			if (this.list[subscriptionId]) {
				this.list[subscriptionId].addSubscriber(subscriberId);
			}
			else {
				this.list[subscriptionId] = newSubscription();
			}
			
		},
		get: function(subscriptionId) {
			if (this.list[subscriptionId]) {
				return this.list[subscriptionId];
			}
			else {
				return [];
			}
		},

	
	};


	module.exports = relay;
})();
