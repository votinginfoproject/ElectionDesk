var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var CBuffer = require('CBuffer');

server.listen(4242);

app.get('/', function (req, res) {
    res.redirect('http://electiondesk.us');
});

io.on('connection', function (socket) {
    socket.on('dump', function (data) {
        buffer.forEach(function (item) {
            socket.emit('update', item);
        });
    });
});

// Load the TCP Library
var net = require('net'),
    carrier = require('carrier');

var buffer = CBuffer(10);

// Start a TCP Server
net.createServer(function (connection) {
    carrier.carry(connection, function(line) {
        //try {
            console.log('Sending interaction');
            io.sockets.emit('update', line);
        //} catch (e) {
        //    console.log('Could not send', line);
        //}
    });
}).listen(4244);