var fs = require('fs');
var options = {};

var app = require('express')(),
    server = require('https').createServer(options, app),
    io = require('socket.io').listen(server);

server.listen(4242);

app.get('/', function (req, res) {
    res.redirect('http://electiondesk.us');
});

io.sockets.on('connection', function (socket) {
    socket.on('subscribe', function(data) { socket.join(data.room); })
    socket.on('unsubscribe', function(data) { socket.leave(data.room); })
});

// Load the TCP Library
var net = require('net'),
    carrier = require('carrier');

// Start a TCP Server
net.createServer(function (connection) {
    carrier.carry(connection, function(line) {
        var data = JSON.parse(line);
        console.log(data);
        io.sockets.volatile.emit('update', data);
    });
}).listen(4244);