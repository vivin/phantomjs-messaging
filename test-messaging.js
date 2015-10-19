var messaging = require("./src/messaging");
var page = require("webpage").create();

page.onConsoleMessage = function(message) {
    console.log(message);
};

page.open("./test-messaging.html", function() {
    var count = 6;

    var channel = messaging.channel(page, {
        alert: {
            phantom: function(name, data) {
                console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
                count--;
            },
            page: function(name, data) {
                console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
            }
        },
        error: {
            phantom: function(name, data) {
                console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
                count--;
            },
            page: function(name, data) {
                console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
            }
        },
        info: {
            phantom: function(name, data) {
                console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
                count--;
            },
            page: function(name, data) {
                console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
            }
        }
    });

    setTimeout(function() {
        channel.toPage("alert", {text: "This is an alert!"});
        count--;
    }, Math.random() * 1500);

    setTimeout(function() {
        channel.toPage("error", {text: "This is an error!"});
        count--;
    }, Math.random() * 1500);

    setTimeout(function() {
        channel.toPage("info", {text: "This is some info!"});
        count--;
    }, Math.random() * 1500);

    page.evaluate(function() {
        setTimeout(function() {
            channel.toPhantom("alert", {text: "This is an alert!"});
        }, Math.random() * 1500);

        setTimeout(function() {
            channel.toPhantom("error", {text: "This is an error!"});
        }, Math.random() * 1500);

        setTimeout(function() {
            channel.toPhantom("info", {text: "This is some info!"});
        }, Math.random() * 1500);
    });

    setInterval(function() {
        if(count === 0) {
            phantom.exit();
        }
    }, 100);
});

