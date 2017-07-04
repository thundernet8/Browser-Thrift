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
var XHRConnection = (function (_super) {
    __extends(XHRConnection, _super);
    function XHRConnection(host, port, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.seqId2Service = {};
        _this.uri = function () {
            var scheme = _this.secure ? 'https' : 'http';
            var port = '';
            var path = _this.path || '/';
            var host = _this.host;
            if (_this.port && (('https' === scheme && _this.port !== 443) ||
                ('http' === scheme && _this.port != 80))) {
                port = ':' + _this.port;
            }
            return scheme + '://' + host + port + path;
        };
        _this.getXmlHttpRequestObject = function () {
            try {
                return new XMLHttpRequest();
            }
            catch (e) { }
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e) { }
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (e) { }
            throw new Error('Your browser does not support XHR.');
        };
        _this._onOpen = function () { };
        _this._onClose = function () { };
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
            _this.emit("error", evt);
        };
        _this.isOpen = function () {
            return true;
        };
        _this.open = function () { };
        _this.xhr = function (data) {
            var xreq = _this.getXmlHttpRequestObject();
            if (xreq["overrideMimeType"]) {
                xreq["overrideMimeType"]("application/json");
            }
            xreq.onreadystatechange = function () {
                if (xreq.readyState === 4 && xreq.status === 200) {
                    _this._onData(xreq.responseText);
                }
                else if (xreq.readyState === 4) {
                    _this._onError(new Error(xreq.statusText));
                }
            };
            xreq.open("POST", _this.uri(), true);
            Object.keys(_this.headers).forEach(function (headerKey) {
                xreq.setRequestHeader(headerKey, _this.headers[headerKey]);
            });
            xreq.send(data);
        };
        _this.close = function () { };
        _this.write = function (data) {
            _this.xhr(data);
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
        _this.headers = options.headers || {};
        _this.path = options.path || '/';
        _this.clients = {};
        return _this;
    }
    return XHRConnection;
}(EventEmitter));
var createXHRConnection = function (host, port, options) {
    return new XHRConnection(host, port, options);
};
export default createXHRConnection;
