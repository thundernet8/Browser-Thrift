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
import { TApplicationExceptionType, ThriftType } from "./thrift-type";
import { inherits } from "util";
export function InputBufferUnderrunError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}
inherits(InputBufferUnderrunError, Error);
var TException = (function () {
    function TException(message) {
        var _this = this;
        this.getMessage = function () {
            return _this.message;
        };
        this.message = message;
        this.name = TException.name;
    }
    return TException;
}());
export { TException };
inherits(TException, Error);
var TApplicationException = (function (_super) {
    __extends(TApplicationException, _super);
    function TApplicationException(type, message) {
        var _this = _super.call(this, message) || this;
        _this.read = function (input) {
            while (1) {
                var ret = input.readFieldBegin();
                if (ret.ftype == ThriftType.STOP) {
                    break;
                }
                var fid = ret.fid;
                switch (fid) {
                    case 1:
                        if (ret.ftype == ThriftType.STRING) {
                            this.message = input.readString();
                        }
                        else {
                            ret = input.skip(ret.ftype);
                        }
                        break;
                    case 2:
                        if (ret.ftype == ThriftType.I32) {
                            this.code = input.readI32();
                        }
                        else {
                            ret = input.skip(ret.ftype);
                        }
                        break;
                    default:
                        ret = input.skip(ret.ftype);
                        break;
                }
                input.readFieldEnd();
            }
            input.readStructEnd();
        };
        _this.write = function (output) {
            output.writeStructBegin('TApplicationException');
            if (this.message) {
                output.writeFieldBegin('message', ThriftType.STRING, 1);
                output.writeString(this.getMessage());
                output.writeFieldEnd();
            }
            if (this.code) {
                output.writeFieldBegin('type', ThriftType.I32, 2);
                output.writeI32(this.code);
                output.writeFieldEnd();
            }
            output.writeFieldStop();
            output.writeStructEnd();
        };
        _this.getCode = function () {
            return this.code;
        };
        _this.name = TApplicationException.name;
        _this.type = TApplicationExceptionType.UNKNOWN;
        return _this;
    }
    return TApplicationException;
}(TException));
export { TApplicationException };
