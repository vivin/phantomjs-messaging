exports.channel = (function() {

    function Channel(page, namespace) {
        this.namespace = "channel" || namespace;
        this.page = page;
        this.listeners = {};

        var self = this;

        var channelMessageHandler = function(message) {
            if(/^__phantom__:/.test(message)) {
                message = message.replace(/^__phantom__:/, "");
                message = JSON.parse(message);
                self.listeners[message.name].call(null, message.name, message.data);
            }
        };

        if(typeof this.page.onConsoleMessage === "undefined") {
            this.page.onConsoleMessage = channelMessageHandler;
        } else {
            var existingHandler = this.page.onConsoleMessage;
            this.page.onConsoleMessage = function(message) {
                if(/^__phantom__:/.test(message)) {
                    channelMessageHandler(message);
                } else {
                    existingHandler(message);
                }
            };
        }

        this.page.evaluate(function(namespace) {
            delete console.log; //restore if missing
            window[namespace] = {
                message: "",
                listeners: {},
                toPhantom: function(messageName, data) {
                    console.log("__phantom__:", JSON.stringify({name: messageName, data: data}));
                }
            };

            window[namespace].channelMessageHandler = function(event) {
                var key = String.fromCharCode(event.keyCode || event.which);

                if(event.ctrlKey && key === "S") {
                    window[namespace].message = "";
                } else if(!event.ctrlKey) {
                    window[namespace].message += key;
                } else if(event.ctrlKey && key === "D") {
                    var message = JSON.parse(window[namespace].message);
                    window[namespace].listeners[message.name].call(null, message.name, message.data);
                }
            };

            document.addEventListener("keypress", window[namespace].channelMessageHandler);
        }, this.namespace);

        Object.freeze(this.page);
    }

    Channel.prototype.toPage = function(messageName, data) {
        this.page.sendEvent("keypress", "S", null, null, 0x04000000);
        this.page.sendEvent("keypress", JSON.stringify({name: messageName, data: data}));
        this.page.sendEvent("keypress", "D", null, null, 0x04000000);
    };

    Channel.prototype.addListeners = function(messageName, listeners) {
        listeners = listeners || {phantom: null, page: null};
        if(listeners.phantom) {
            this.listeners[messageName] = listeners.phantom;
        }

        if(listeners.page) {
            this.page.evaluate(function(namespace, messageName, listenerSource) {
                window[namespace].listeners[messageName] = new Function("return " + listenerSource)();
            }, this.namespace, messageName, listeners.page.toString());
        }

        return this;
    };

    return function(page, listeners, namespace) {
        var channel = new Channel(page, namespace);
        Object.keys(listeners).forEach(function(messageName) {
            channel.addListeners(messageName, listeners[messageName]);
        });

        return channel;
    };
})();
