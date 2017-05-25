const net = require('net');

// Define Omeage 2 server address, port and password here
const ADDRESS = '';
const PORT = 0;
const PASSWORD = '';

exports.controlLight = function(command, target) {
  var client = new net.Socket();
  client.connect(PORT, ADDRESS, function() {
    client.write(PASSWORD + command + target);
  });
}