import { ThriftType } from '../thrift-type';
import { Buffer } from 'buffer';
import { InputBufferUnderrunError } from '../error';
var TJSONProtocol = (function () {
    function TJSONProtocol(trans) {
        var _this = this;
        this.flush = function () {
            _this.writeToTransportIfStackIsFlushable();
            return _this.trans.flush();
        };
        this.writeToTransportIfStackIsFlushable = function () {
            if (_this.tstack.length === 1) {
                _this.trans.write(_this.tstack.pop());
            }
        };
        this.writeMessageBegin = function (name, messageType, seqId) {
            _this.tstack.push([TJSONProtocol.Version, "\"" + name + "\"", messageType, seqId]);
        };
        this.writeMessageEnd = function () {
            var obj = _this.tstack.pop();
            _this.wobj = _this.tstack.pop();
            _this.wobj.push(obj);
            _this.wbuf = "[" + _this.wobj.join(',') + "]";
            _this.trans.write(_this.wbuf);
        };
        this.writeStructBegin = function (name) {
            _this.tpos.push(_this.tstack.length);
            _this.tstack.push({});
        };
        this.writeStructEnd = function () {
            var p = _this.tpos.pop();
            var struct = _this.tstack[p];
            var str = '{';
            var first = true;
            for (var key in struct) {
                if (first) {
                    first = false;
                }
                else {
                    str += ',';
                }
                str += key + ":" + struct[key];
            }
            str += '}';
            _this.tstack[p] = str;
            _this.writeToTransportIfStackIsFlushable();
        };
        this.writeFieldBegin = function (name, fieldType, fieldId) {
            _this.tpos.push(_this.tstack.length);
            _this.tstack.push({
                fieldId: "\"" + fieldId + "\"",
                fieldType: TJSONProtocol.Type[fieldType]
            });
        };
        this.writeFieldEnd = function () {
            var value = _this.tstack.pop();
            var fieldInfo = _this.tstack.pop();
            if (':' + value === ':[object Object]') {
                _this.tstack[_this.tstack.length - 1][fieldInfo.fieldId] = "{" + fieldInfo.fieldType + ":" + JSON.stringify(value) + "}";
            }
            else {
                _this.tstack[_this.tstack.length - 1][fieldInfo.fieldId] = "{" + fieldInfo.fieldType + ":" + value + "}";
            }
            _this.tpos.pop();
            _this.writeToTransportIfStackIsFlushable();
        };
        this.writeFieldStop = function () {
        };
        this.writeMapBegin = function (keyType, valType, size) {
            _this.tpos.push(_this.tstack.length);
            _this.tstack.push([TJSONProtocol.Type[keyType], TJSONProtocol.Type[valType], 0]);
        };
        this.writeMapEnd = function () {
            var p = _this.tpos.pop();
            if (p === _this.tstack.length) {
                return;
            }
            if ((_this.tstack.length - p - 1) % 2 !== 0) {
                _this.tstack.push('');
            }
            var size = (_this.tstack.length - p - 1) / 2;
            _this.tstack[p][_this.tstack[p].length - 1] = size;
            var map = '}';
            var first = true;
            while (_this.tstack.length > p + 1) {
                var v = _this.tstack.pop();
                var k = _this.tstack.pop();
                if (first) {
                    first = false;
                }
                else {
                    map = ',' + map;
                }
                if (!isNaN(k)) {
                    k = "\"" + k + "\"";
                }
                map = k + ":" + v + map;
            }
            map = '{' + map;
            _this.tstack[p].push(map);
            _this.tstack[p] = "[" + _this.tstack[p].join(',') + "]";
            _this.writeToTransportIfStackIsFlushable();
        };
        this.writeListBegin = function (elemType, size) {
            _this.tpos.push(_this.tstack.length);
            _this.tstack.push([TJSONProtocol.Type[elemType], size]);
        };
        this.writeListEnd = function () {
            var p = _this.tpos.pop();
            while (_this.tstack.length > p + 1) {
                var tmpVal = _this.tstack[p + 1];
                _this.tstack.splice(p + 1, 1);
                _this.tstack[p].push(tmpVal);
            }
            _this.tstack[p] = "[" + _this.tstack[p].join(',') + "]";
            _this.writeToTransportIfStackIsFlushable();
        };
        this.writeSetBegin = function (elemType, size) {
            _this.tpos.push(_this.tstack.length);
            _this.tstack.push([TJSONProtocol.Type[elemType], size]);
        };
        this.writeSetEnd = function () {
            var p = _this.tpos.pop();
            while (_this.tstack.length > p + 1) {
                var tmpVal = _this.tstack[p + 1];
                _this.tstack.splice(p + 1, 1);
                _this.tstack[p].push(tmpVal);
            }
            _this.tstack[p] = "[" + _this.tstack[p].join(',') + "]";
            _this.writeToTransportIfStackIsFlushable();
        };
        this.writeBool = function (bool) {
            _this.tstack.push(bool ? 1 : 0);
        };
        this.writeByte = function (byte) {
            _this.tstack.push(byte);
        };
        this.writeI16 = function (i16) {
            _this.tstack.push(i16);
        };
        this.writeI32 = function (i32) {
            _this.tstack.push(i32);
        };
        this.writeI64 = function (i64) {
            _this.tstack.push(i64);
        };
        this.writeDouble = function (dub) {
            _this.tstack.push(dub);
        };
        this.writeString = function (arg) {
            if (arg === null) {
                _this.tstack.push(null);
            }
            else {
                var str = void 0;
                if (typeof arg === 'string') {
                    str = arg;
                }
                else if (arg instanceof Buffer) {
                    str = arg.toString('utf8');
                }
                else {
                    throw new Error("writeString called without a string/Buffer argument: " + arg);
                }
                var escapedString = '';
                for (var i = 0; i < str.length; i++) {
                    var ch = str.charAt(i);
                    if (ch === '\"') {
                        escapedString += '\\\"';
                    }
                    else if (ch === '\\') {
                        escapedString += '\\\\';
                    }
                    else if (ch === '\b') {
                        escapedString += '\\b';
                    }
                    else if (ch === '\f') {
                        escapedString += '\\f';
                    }
                    else if (ch === '\n') {
                        escapedString += '\\n';
                    }
                    else if (ch === '\r') {
                        escapedString += '\\r';
                    }
                    else if (ch === '\t') {
                        escapedString += '\\t';
                    }
                    else {
                        escapedString += ch;
                    }
                }
                _this.tstack.push("\"" + escapedString + "\"");
            }
        };
        this.writeBinary = function (arg) {
            var buf;
            if (typeof arg === 'string') {
                buf = new Buffer(arg, 'binary');
            }
            else if (arg instanceof Buffer || Object.prototype.toString.call(arg) === '[object Uint8Array]') {
                buf = arg;
            }
            else {
                throw new Error("writeBinary called without a string/Buffer argument: " + arg);
            }
            _this.tstack.push("\"" + buf.toString('base64') + "\"");
        };
        this.readMessageBegin = function () {
            _this.rstack = [];
            _this.rpos = [];
            var transBuf = _this.trans.borrow();
            if (transBuf.readIndex >= transBuf.writeIndex) {
                throw new InputBufferUnderrunError();
            }
            var cursor = transBuf.readIndex;
            if (transBuf.buf[cursor] !== 0x5B) {
                throw new Error("Malformed JSON input, no opening bracket");
            }
            cursor++;
            var openBracketCount = 1;
            var inString = false;
            for (; cursor < transBuf.writeIndex; cursor++) {
                var chr = transBuf.buf[cursor];
                if (inString) {
                    if (chr === 0x22) {
                        inString = false;
                    }
                    else if (chr === 0x5C) {
                        cursor += 1;
                    }
                }
                else {
                    if (chr === 0x5B) {
                        openBracketCount += 1;
                    }
                    else if (chr === 0x5D) {
                        openBracketCount -= 1;
                        if (openBracketCount === 0) {
                            break;
                        }
                    }
                    else if (chr === 0x22) {
                        inString = true;
                    }
                }
            }
            if (openBracketCount !== 0) {
                throw new InputBufferUnderrunError();
            }
            _this.robj = JSON.parse(transBuf.buf.slice(transBuf.readIndex, cursor + 1).toString());
            _this.trans.consume(cursor + 1 - transBuf.readIndex);
            var version = _this.robj.shift();
            if (version != TJSONProtocol.Version) {
                throw new Error('Wrong thrift protocol version: ' + version);
            }
            var r = {};
            r.fname = _this.robj.shift();
            r.mtype = _this.robj.shift();
            r.rseqid = _this.robj.shift();
            _this.rstack.push(_this.robj.shift());
            return r;
        };
        this.readMessageEnd = function () { };
        this.readStructBegin = function () {
            var r = {};
            r.fname = "";
            if (_this.rstack[_this.rstack.length - 1] instanceof Array) {
                _this.rstack.push(_this.rstack[_this.rstack.length - 1].shift());
            }
            return r;
        };
        this.readStructEnd = function () {
            _this.rstack.pop();
        };
        this.readFieldBegin = function () {
            var r = {};
            var fid = -1;
            var ftype = ThriftType.STOP;
            for (var f in (_this.rstack[_this.rstack.length - 1])) {
                if (f === null) {
                    continue;
                }
                fid = parseInt(f, 10);
                _this.rpos.push(_this.rstack.length);
                var field = _this.rstack[_this.rstack.length - 1][fid];
                delete _this.rstack[_this.rstack.length - 1][fid];
                _this.rstack.push(field);
                break;
            }
            if (fid != -1) {
                for (var i in (_this.rstack[_this.rstack.length - 1])) {
                    if (TJSONProtocol.RType[i] === null) {
                        continue;
                    }
                    ftype = TJSONProtocol.RType[i];
                    _this.rstack[_this.rstack.length - 1] = _this.rstack[_this.rstack.length - 1][i];
                }
            }
            r.fname = '';
            r.ftype = ftype;
            r.fid = fid;
            return r;
        };
        this.readFieldEnd = function () {
            var p = _this.rpos.pop();
            while (_this.rstack.length > p) {
                _this.rstack.pop();
            }
        };
        this.readMapBegin = function () {
            var map = _this.rstack.pop();
            var first = map.shift();
            if (first instanceof Array) {
                _this.rstack.push(map);
                map = first;
                first = map.shift();
            }
            var r = {};
            r.ktype = TJSONProtocol.RType[first];
            r.vtype = TJSONProtocol.RType[map.shift()];
            r.size = map.shift();
            _this.rpos.push(_this.rstack.length);
            _this.rstack.push(map.shift());
            return r;
        };
        this.readMapEnd = function () {
            _this.readFieldEnd();
        };
        this.readListBegin = function () {
            var list = _this.rstack[_this.rstack.length - 1];
            var r = {};
            r.etype = TJSONProtocol.RType[list.shift()];
            r.size = list.shift();
            _this.rpos.push(_this.rstack.length);
            _this.rstack.push(list.shift());
            return r;
        };
        this.readListEnd = function () {
            var p = _this.rpos.pop() - 2;
            var st = _this.rstack;
            st.pop();
            if (st instanceof Array && st.length > p && st[p].length > 0) {
                st.push(st[p].shift());
            }
        };
        this.readSetBegin = function () {
            return _this.readListBegin();
        };
        this.readSetEnd = function () {
            return _this.readListEnd();
        };
        this.readBool = function () {
            return _this.readValue() === "1";
        };
        this.readByte = function () {
            return _this.readI32();
        };
        this.readI16 = function () {
            return _this.readI32();
        };
        this.readI32 = function () {
            return +_this.readValue();
        };
        this.readValue = function (f) {
            if (f === undefined) {
                f = _this.rstack[_this.rstack.length - 1];
            }
            var r = {};
            if (f instanceof Array) {
                if (f.length === 0) {
                    r.value = undefined;
                }
                else {
                    r.value = f.shift();
                }
            }
            else if (f instanceof Object) {
                for (var i in f) {
                    if (i === null) {
                        continue;
                    }
                    _this.rstack.push(f[i]);
                    delete f[i];
                    r.value = i;
                    break;
                }
            }
            else {
                r.value = f;
                _this.rstack.pop();
            }
            return r.value;
        };
        this.readI64 = function () {
            return _this.readI32();
        };
        this.readDouble = function () {
            return _this.readI32();
        };
        this.readBinary = function () {
            return new Buffer(_this.readValue(), 'base64');
        };
        this.readString = function () {
            return _this.readValue();
        };
        this.getTransport = function () {
            return _this.trans;
        };
        this.skip = function (type) {
            var ret, i;
            switch (type) {
                case ThriftType.STOP:
                    return null;
                case ThriftType.BOOL:
                    return _this.readBool();
                case ThriftType.BYTE:
                    return _this.readByte();
                case ThriftType.I16:
                    return _this.readI16();
                case ThriftType.I32:
                    return _this.readI32();
                case ThriftType.I64:
                    return _this.readI64();
                case ThriftType.DOUBLE:
                    return _this.readDouble();
                case ThriftType.STRING:
                    return _this.readString();
                case ThriftType.STRUCT:
                    _this.readStructBegin();
                    while (true) {
                        ret = _this.readFieldBegin();
                        if (ret.ftype == ThriftType.STOP) {
                            break;
                        }
                        _this.skip(ret.ftype);
                        _this.readFieldEnd();
                    }
                    _this.readStructEnd();
                    return null;
                case ThriftType.MAP:
                    ret = _this.readMapBegin();
                    for (i = 0; i < ret.size; i++) {
                        if (i > 0) {
                            if (_this.rstack.length > _this.rpos[_this.rpos.length - 1] + 1) {
                                _this.rstack.pop();
                            }
                        }
                        _this.skip(ret.ktype);
                        _this.skip(ret.vtype);
                    }
                    _this.readMapEnd();
                    return null;
                case ThriftType.SET:
                    ret = _this.readSetBegin();
                    for (i = 0; i < ret.size; i++) {
                        _this.skip(ret.etype);
                    }
                    _this.readSetEnd();
                    return null;
                case ThriftType.LIST:
                    ret = _this.readListBegin();
                    for (i = 0; i < ret.size; i++) {
                        _this.skip(ret.etype);
                    }
                    _this.readListEnd();
                    return null;
            }
        };
        this.tstack = [];
        this.tpos = [];
        this.trans = trans;
    }
    TJSONProtocol.Type = (_a = {},
        _a[ThriftType.BOOL] = '"tf"',
        _a[ThriftType.BYTE] = '"i8"',
        _a[ThriftType.I16] = '"i16"',
        _a[ThriftType.I32] = '"i32"',
        _a[ThriftType.I64] = '"i64"',
        _a[ThriftType.DOUBLE] = '"dbl"',
        _a[ThriftType.STRUCT] = '"rec"',
        _a[ThriftType.STRING] = '"str"',
        _a[ThriftType.MAP] = '"map"',
        _a[ThriftType.LIST] = '"lst"',
        _a[ThriftType.SET] = '"set"',
        _a);
    TJSONProtocol.RType = {
        tf: ThriftType.BOOL,
        i8: ThriftType.BYTE,
        i16: ThriftType.I16,
        i32: ThriftType.I32,
        i64: ThriftType.I64,
        dbl: ThriftType.DOUBLE,
        rec: ThriftType.STRUCT,
        str: ThriftType.STRING,
        map: ThriftType.MAP,
        lst: ThriftType.LIST,
        set: ThriftType.SET
    };
    TJSONProtocol.Version = 1;
    return TJSONProtocol;
}());
export default TJSONProtocol;
var _a;
