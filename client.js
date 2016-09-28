var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
var WebSocket = require('reconnecting-websocket');

sharedb.types.register(richText.type);

let wsUrl;
if (window.location.protocol === "http:") {
  wsUrl = 'ws://' + window.location.host;
} else {
  wsUrl = 'wss://' + window.location.host;
}

// Open WebSocket connection to ShareDB server
const options = {connectionTimeout: 5000};
var socket = new WebSocket(wsUrl, null, options);
var connection = new sharedb.Connection(socket);

// For testing reconnection
window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new WebSocket(wsUrl);
  connection.bindToSocket(socket);
};

// Create local Doc instance mapped to 'examples' collection document with id 'richtext'
var doc = connection.get('examples', 'richtext');
doc.subscribe(function(err) {
  if (err) throw err;
  var outstandingRequests = 0;
  var quill = new Quill('#editor', {theme: 'snow'});
  // TODO(now): error in qull.js: line with lastOp.insert[lastOp.insert.length - 1] fails if lastOp isn't an insert.
  quill.setContents(doc.data);
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source !== 'user') return;
    document.getElementById("spinner").className = "visible";
    ++outstandingRequests;
    doc.submitOp(delta, {source: quill}, function (err) {
      if (err) {
        console.error(err);
        // TODO(someday): display this to user
      }

      if (--outstandingRequests === 0) {
      document.getElementById("spinner").className = "";
      }
    });
  });
  doc.on('op', function(op, source) {
    if (source === quill) return;
    quill.updateContents(op);
  });

  function permListener () {
    var permissions = JSON.parse(this.responseText);
    if (permissions.indexOf("modify") === -1) {
      quill.disable();
    }
  }

  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", permListener);
  oReq.open("GET", "/_permissions");
  oReq.send();
});
