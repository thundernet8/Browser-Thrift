var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { EventEmitter } from 'events';
import { Buffer } from 'buffer';
import TBufferedTransport from '../transport/buffer';
import TJSONProtocol from '../protocol/json';
import { TApplicationExceptionType } from "../thrift-type";
import { TApplicationException, InputBufferUnderrunError } from "../error";
var WSConnection = (function (_super) {
    __extends(WSConnection, _super);
    function WSConnection(host, port, options) {
        var _this = _super.call(this) || this;
        _this.send_pending = [];
        _this.seqId2Service = {};
        _this.uri = function () {
            var scheme = _this.secure ? 'wss' : 'ws';
            var port = '';
            var path = _this.path || '/';
            var host = _this.host;
            if (_this.port && (('wss' === scheme && _this.port !== 443) ||
                ('ws' === scheme && _this.port != 80))) {
                port = ':' + _this.port;
            }
            return scheme + '://' + host + port + path;
        };
        _this._reset = function () {
            _this.socket = null;
            _this.send_pending = [];
        };
        _this._onOpen = function () {
            _this.emit('open');
            if (_this.send_pending.length > 0) {
                _this.send_pending.forEach(function (data) {
                    _this.socket.send(data);
                });
            }
        };
        _this._onClose = function () {
            _this.emit('close');
            _this._reset();
        };
        _this._onData = function (data) {
            if (Object.prototype.toString.call(data) === '[object ArrayBuffer') {
                data = new Uint8Array(data);
            }
            var buf = new Buffer(data);
            _this.transport.receiver(_this._decodeCallback.bind(_this))(buf);
        };
        _this._onMessage = function (evt) {
            _this._onData(evt.data);
        };
        _this._onError = function (evt) {
            _this.emit('error', evt);
            _this.socket.close();
        };
        _this.isOpen = function () {
            return _this.socket && _this.socket.readyState === _this.socket.OPEN;
        };
        _this.open = function () {
            if (_this.socket && _this.socket.readyState !== _this.socket.CLOSED) {
                return;
            }
            _this.socket = new WebSocket(_this.uri());
            _this.socket.binaryType = 'arraybuffer';
            _this.socket.onopen = _this._onOpen;
            _this.socket.onmessage = _this._onMessage;
            _this.socket.onerror = _this._onError;
            _this.socket.onclose = _this._onClose;
        };
        _this.close = function () {
            _this.socket.close();
        };
        _this.write = function (data) {
            if (_this.isOpen()) {
                _this.socket.send(data);
            }
            else {
                _this.send_pending.push(data);
            }
        };
        _this._decodeCallback = function (trans) {
            var proto = new _this.protocol(trans);
            try {
                var _loop_1 = function () {
                    var header = proto.readMessageBegin();
                    var client = _this.clients[header.rseqid] || null;
                    if (!client) {
                        _this.emit("error", new TApplicationException(TApplicationExceptionType.MISSING_SERVICE_CLIENT, "Received a response to an unknown service client"));
                    }
                    delete _this.clients[header.rseqid];
                    var clientWrappedCb = function (err, success) {
                        trans.commitPosition();
                        var clientCb = client.reqs[header.rseqid];
                        delete client.reqs[header.rseqid];
                        if (clientCb) {
                            clientCb(err, success);
                        }
                    };
                    if (client["recv_" + header.fname]) {
                        var dummy_seqid = header.rseqid * -1;
                        client.reqs[dummy_seqid] = clientWrappedCb;
                        client["recv_" + header.fname](proto, header.mtype, dummy_seqid);
                    }
                    else {
                        _this.emit("error", new TApplicationException(TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function"));
                    }
                };
                while (true) {
                    _loop_1();
                }
            }
            catch (e) {
                if (e instanceof InputBufferUnderrunError) {
                    trans.rollbackPosition();
                }
                else {
                    throw e;
                }
            }
        };
        _this.host = host;
        _this.port = port;
        _this.secure = !!options.secure || false;
        _this.transport = options.transport || TBufferedTransport;
        _this.protocol = options.protocol || TJSONProtocol;
        _this.path = options.path || '/';
        _this.clients = {};
        return _this;
    }
    return WSConnection;
}(EventEmitter));
var createWSConnection = function (host, port, options) {
    return new WSConnection(host, port, options);
};
export default createWSConnection;
