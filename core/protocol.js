(function() {
	'use strict';

	var protocol = {
		REGISTER: "register",
		UNREGISTER: "unregister",
		MESSAGE: "message",
		BROADCAST: "broadcast",
		PUBLISH: "publish",
		SUBSCRIBE: "subscribe",
		SERVER_ACK: "server_ack",

		SUBSCRIBE_TO: {
			ONE: "one",
			CLASS: "class",
			PRESENCE: "presence",
		},

		isValidData: function(data) {
			switch (data.type) {
				case this.REGISTER:
					if (data.networkName && data.className) {
						return true;
					}
					return false;
				case this.UNREGISTER:
					if (data) {
						return true;
					}
					return false;
				case this.MESSAGE:
					if (data.message && data.to) {
						return true;
					}
					return false;
				case this.BROADCAST:
					if (data.message) {
						return true;
					}
					return false;
				case this.PUBLISH:
					if (data.message) {
						return true;
					}
					return false;
				case this.SUBSCRIBE:
					if (data.subscribeTo === this.SUBSCRIBE_TO.PRESENCE) {
						return true;
					}
					return false;
				case this.SERVER_ACK:
					if (data) {
						return true;
					}
					return false;
				default:
					return false;
			}
		},
	};

	module.exports = protocol;
})();

