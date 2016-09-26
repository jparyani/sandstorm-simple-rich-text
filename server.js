var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
const db = require('sharedb-mongo')('mongodb://127.0.0.1:27017/test');

ShareDB.types.register(richText.type);
const backend = new ShareDB({db});
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
  var connection = backend.connect();
  var doc = connection.get('examples', 'richtext');
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([{insert: 'Hi!'}], 'rich-text', callback);
      return;
    }
    callback();
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  app.use(express.static('node_modules/quill/dist'));
  app.get("/_permissions", function (req, res) {
    const permissions = req.headers['x-sandstorm-permissions'];
    // if (!permissions) {
    //   res.status(500).send("no permissions");
    // } else {
      res.send(permissions.split(','));
    // }
  });

  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  backend.use('submit', function (action, cb) {
    const permissions = action.agent.stream.ws.upgradeReq.headers['x-sandstorm-permissions'];
    if (!permissions || permissions.indexOf("modify") === -1) {
      throw new Error("User does not have write permissions");
    }
    cb();
  });

  server.listen(8080);
  console.log('Listening on http://localhost:8080');
}
