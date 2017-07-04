var createClient = (function () {
    var clientId = 0;
    return function (ServiceClient, connection) {
        clientId++;
        var flushCallback = function (buf) {
            connection.write(buf);
        };
        var transport = new connection.transport(flushCallback);
        var client = new ServiceClient(transport, connection.protocol);
        client.id = clientId;
        connection.clients[clientId] = client;
        return client;
    };
})();
export default createClient;
