messaging
=========

This is a little library that (ab)uses `onConsoleMessage` and `sendEvent` to accomplish bidirectional communication between PhantomJS and a webpage. You can set up a bidirectional communication-channel on individual page instances, and register message handlers for specific message names.

Setting up the channel on a page instance (do this once the page has opened successfully):
```javascript
var channel = messaging.channel(page, {
    alert: {
        phantom: function(name, data) {
            console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        },
        page: function(name, data) {
            console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        }
    },
    error: {
        phantom: function(name, data) {
            console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        },
        page: function(name, data) {
            console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        }
    },
    info: {
        phantom: function(name, data) {
            console.log("[phantom:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        },
        page: function(name, data) {
            console.log("[page:" + name + "]", "Received: " + data.text, "at", new Date().toISOString());
        }
    }
});
```

To send a message to the page:
```javascript
channel.toPage("alert", {text: "This is an alert!"});
```

To send a message to PhantomJS (this will need to be done within the callback to `page.evaluate`):
```javascript
channel.toPhantom("alert", {text: "This is an alert!"});
```

`channel` is just the default variable-name that is used within the page context. If this clashes with something already on the page, you can pass in a string as the third argument to `messaging.channel`, that has a different variable-name. 
