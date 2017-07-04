import { TApplicationExceptionType, ThriftType } from "./thrift-type"
import { inherits } from "util"
import IProtocol from "./interface/IProtocol"

export function InputBufferUnderrunError(message?: string) {
    Error.call(this)
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
}
inherits(InputBufferUnderrunError, Error)

export class TException {
    private message: string;
    public name: string;

    constructor(message?: string) {
        this.message = message
        this.name = TException.name
    }

    getMessage = () => {
        return this.message
    }
}
inherits(TException, Error)

export class TApplicationException extends TException {
    type: TApplicationExceptionType;
    name: string;
    constructor(type?: TApplicationExceptionType, message?: string) {
        super(message)
        this.name = TApplicationException.name
        this.type = TApplicationExceptionType.UNKNOWN
    }

    read = function (input: IProtocol) {
        while (1) {
            var ret = input.readFieldBegin();

            if (ret.ftype == ThriftType.STOP) {
                break;
            }

            var fid = ret.fid;

            switch (fid) {
                case 1:
                    if (ret.ftype == ThriftType.STRING) {
                        this.message = input.readString()
                    } else {
                        ret = input.skip(ret.ftype);
                    }
                    break;
                case 2:
                    if (ret.ftype == ThriftType.I32) {
                        this.code = input.readI32()
                    } else {
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
    }

    write = function (output) {
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
    }

    getCode = function () {
        return this.code;
    }
}
