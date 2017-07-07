import { InputBufferUnderrunError } from "../error";
import * as binaryHelper from "../binary";
var TBufferedTransport = (function () {
    function TBufferedTransport(onFlushCb) {
        var _this = this;
        this.defaultBufSize = 1024;
        this.writeCursor = 0;
        this.readCursor = 0;
        this.inBuf = new Buffer(this.defaultBufSize);
        this.outBuffers = [];
        this.outCount = 0;
        this.commitPosition = function () {
            var unreadSize = _this.writeCursor - _this.readCursor;
            var bufSize = unreadSize * 2 > _this.defaultBufSize
                ? unreadSize * 2
                : _this.defaultBufSize;
            var buf = new Buffer(bufSize);
            if (unreadSize > 0) {
                _this.inBuf.copy(buf, 0, _this.readCursor, _this.writeCursor);
            }
            _this.readCursor = 0;
            _this.writeCursor = unreadSize;
            _this.inBuf = buf;
        };
        this.rollbackPosition = function () {
            _this.readCursor = 0;
        };
        this.isOpen = function () {
            return true;
        };
        this.open = function () { };
        this.close = function () { };
        this.ensureAvaiable = function (len) {
            if (_this.readCursor + len > _this.writeCursor) {
                throw new InputBufferUnderrunError("");
            }
        };
        this.read = function (len) {
            _this.ensureAvaiable(len);
            var buf = new Buffer(len);
            _this.inBuf.copy(buf, 0, _this.readCursor, _this.readCursor + len);
            _this.readCursor += len;
            return buf;
        };
        this.readByte = function () {
            _this.ensureAvaiable(1);
            return binaryHelper.readByte(_this.inBuf[_this.readCursor++]);
        };
        this.readI16 = function () {
            _this.ensureAvaiable(2);
            var i16 = binaryHelper.readI16(_this.inBuf, _this.readCursor);
            _this.readCursor += 2;
            return i16;
        };
        this.readI32 = function () {
            _this.ensureAvaiable(4);
            var i32 = binaryHelper.readI32(_this.inBuf, _this.readCursor);
            _this.readCursor += 4;
            return i32;
        };
        this.readDouble = function () {
            _this.ensureAvaiable(8);
            var dob = binaryHelper.readDouble(_this.inBuf, _this.readCursor);
            _this.readCursor += 8;
            return dob;
        };
        this.readString = function (len) {
            _this.ensureAvaiable(len);
            var str = _this.inBuf.toString("utf8", _this.readCursor, _this.readCursor + len);
            _this.readCursor += len;
            return str;
        };
        this.borrow = function () {
            return {
                buf: _this.inBuf,
                readIndex: _this.readCursor,
                writeIndex: _this.writeCursor
            };
        };
        this.consume = function (bytesConsumed) {
            _this.readCursor += bytesConsumed;
        };
        this.write = function (buf) {
            if (typeof buf === "string") {
                buf = new Buffer(buf, "utf8");
            }
            _this.outBuffers.push(buf);
            _this.outCount += buf.length;
        };
        this.flush = function () {
            if (_this.outCount < 1) {
                return;
            }
            var msg = new Buffer(_this.outCount);
            var pos = 0;
            _this.outBuffers.forEach(function (buf) {
                buf.copy(msg, pos, 0);
                pos += buf.length;
            });
            if (_this.onFlush) {
                _this.onFlush(msg);
            }
            _this.outBuffers = [];
            _this.outCount = 0;
        };
        this.onFlush = onFlushCb;
    }
    TBufferedTransport.receiver = function (callback, seqid) {
        var reader = new TBufferedTransport();
        return function (data) {
            if (reader.writeCursor + data.length > reader.inBuf.length) {
                var buf = new Buffer(reader.writeCursor + data.length);
                reader.inBuf.copy(buf, 0, 0, reader.writeCursor);
                reader.inBuf = buf;
            }
            data.copy(reader.inBuf, reader.writeCursor, 0);
            reader.writeCursor += data.length;
            callback(reader, seqid);
        };
    };
    return TBufferedTransport;
}());
export default TBufferedTransport;
