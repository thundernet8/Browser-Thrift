import Thrift from "../../../src/thrift-browser"
const { ThriftType, MessageType, TApplicationException, TException } = Thrift

export const INT32CONSTANT = 9853

export const MAPCONSTANT = {
    'hello': 'world',
    'goodnight': 'moon'
}

export enum Operation {
    ADD = 1,
    SUBTRACT = 2,
    MULTIPLY = 3,
    DIVIDE = 4
}

export class Work {
    num1: number = 0;
    num2: number;
    op: Operation;
    comment?: string;

    constructor(args?) {
        this.num1 = 0
        this.num2 = null
        this.op = null
        this.comment = null
        if (args) {
            if (args.num1 !== undefined && args.num1 !== null) {
                this.num1 = args.num1
            }
            if (args.num2 !== undefined && args.num2 !== null) {
                this.num2 = args.num2
            }
            if (args.op !== undefined && args.op !== null) {
                this.op = args.op
            }
            if (args.comment !== undefined && args.comment !== null) {
                this.comment = args.comment
            }
        }
    }

    read = function (input) {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype == ThriftType.I32) {
                        this.num1 = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype == ThriftType.I32) {
                        this.num2 = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 3:
                    if (ftype == ThriftType.I32) {
                        this.op = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 4:
                    if (ftype == ThriftType.STRING) {
                        this.comment = input.readString();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = function (output) {
        output.writeStructBegin('Work');
        if (this.num1 !== null && this.num1 !== undefined) {
            output.writeFieldBegin('num1', ThriftType.I32, 1);
            output.writeI32(this.num1);
            output.writeFieldEnd();
        }
        if (this.num2 !== null && this.num2 !== undefined) {
            output.writeFieldBegin('num2', ThriftType.I32, 2);
            output.writeI32(this.num2);
            output.writeFieldEnd();
        }
        if (this.op !== null && this.op !== undefined) {
            output.writeFieldBegin('op', ThriftType.I32, 3);
            output.writeI32(this.op);
            output.writeFieldEnd();
        }
        if (this.comment !== null && this.comment !== undefined) {
            output.writeFieldBegin('comment', ThriftType.STRING, 4);
            output.writeString(this.comment);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

export class InvalidOperation extends TException {
    public whatOp: number;
    public why: string;
    public name: string;

    constructor(args?) {
        super(args.why)
        this.name = "InvalidOperation"
        this.whatOp = null
        this.why = null
        if (args) {
            if (args.whatOp !== undefined && args.whatOp !== null) {
                this.whatOp = args.whatOp
            }
            if (args.why !== undefined && args.why !== null) {
                this.why = args.why
            }
        }
    }

    read = function (input) {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {//
                case 1:
                    if (ftype == ThriftType.I32) {
                        this.whatOp = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype == ThriftType.STRING) {
                        this.why = input.readString();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = function (output) {
        output.writeStructBegin('InvalidOperation');
        if (this.whatOp !== null && this.whatOp !== undefined) {
            output.writeFieldBegin('whatOp', ThriftType.I32, 1);
            output.writeI32(this.whatOp);
            output.writeFieldEnd();
        }
        if (this.why !== null && this.why !== undefined) {
            output.writeFieldBegin('why', ThriftType.STRING, 2);
            output.writeString(this.why);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

export class Calculator_ping_args {
    constructor(args?) {

    }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            input.skip(ftype);
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_ping_args');
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

export class Calculator_ping_result {
    public success: any;

    constructor(args?) { }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            input.skip(ftype);
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_ping_result');
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

//HELPER FUNCTIONS AND STRUCTURES

export class Calculator_add_args {
    public num1: number;
    public num2: number;

    constructor(args?) {
        this.num1 = null;
        this.num2 = null;
        if (args) {
            if (args.num1 !== undefined && args.num1 !== null) {
                this.num1 = args.num1;
            }
            if (args.num2 !== undefined && args.num2 !== null) {
                this.num2 = args.num2;
            }
        }
    }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype == ThriftType.I32) {
                        this.num1 = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype == ThriftType.I32) {
                        this.num2 = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_add_args');
        if (this.num1 !== null && this.num1 !== undefined) {
            output.writeFieldBegin('num1', ThriftType.I32, 1);
            output.writeI32(this.num1);
            output.writeFieldEnd();
        }
        if (this.num2 !== null && this.num2 !== undefined) {
            output.writeFieldBegin('num2', ThriftType.I32, 2);
            output.writeI32(this.num2);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

export class Calculator_add_result {
    public success: any;
    constructor(args?) {
        this.success = null;
        if (args) {
            if (args.success !== undefined && args.success !== null) {
                this.success = args.success;
            }
        }
    }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {
                case 0:
                    if (ftype == ThriftType.I32) {
                        this.success = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 0:
                    input.skip(ftype);
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_add_result');
        if (this.success !== null && this.success !== undefined) {
            output.writeFieldBegin('success', ThriftType.I32, 0);
            output.writeI32(this.success);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}


export class Calculator_calculate_args {
    public logid: number;
    public w: Work;

    constructor(args?) {
        this.logid = null;
        this.w = null;
        if (args) {
            if (args.logid !== undefined && args.logid !== null) {
                this.logid = args.logid;
            }
            if (args.w !== undefined && args.w !== null) {
                this.w = new Work(args.w);
            }
        }
    }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {
                case 1:
                    if (ftype == ThriftType.I32) {
                        this.logid = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 2:
                    if (ftype == ThriftType.STRUCT) {
                        this.w = new Work();
                        this.w.read(input);
                    } else {
                        input.skip(ftype);
                    }
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_calculate_args');
        if (this.logid !== null && this.logid !== undefined) {
            output.writeFieldBegin('logid', ThriftType.I32, 1);
            output.writeI32(this.logid);
            output.writeFieldEnd();
        }
        if (this.w !== null && this.w !== undefined) {
            output.writeFieldBegin('w', ThriftType.STRUCT, 2);
            this.w.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
};


export class Calculator_calculate_result {
    public success: any;
    public ouch: InvalidOperation;
    constructor(args?) {
        this.success = null;
        this.ouch = null;
        if (args instanceof InvalidOperation) {
            this.ouch = args;
            return;
        }
        if (args) {
            if (args.success !== undefined && args.success !== null) {
                this.success = args.success;
            }
            if (args.ouch !== undefined && args.ouch !== null) {
                this.ouch = args.ouch;
            }
        }
    }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            switch (fid) {
                case 0:
                    if (ftype == ThriftType.I32) {
                        this.success = input.readI32();
                    } else {
                        input.skip(ftype);
                    }
                    break;
                case 1:
                    if (ftype == ThriftType.STRUCT) {
                        this.ouch = new InvalidOperation();
                        this.ouch.read(input);
                    } else {
                        input.skip(ftype);
                    }
                    break;
                default:
                    input.skip(ftype);
            }
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_calculate_result');
        if (this.success !== null && this.success !== undefined) {
            output.writeFieldBegin('success', ThriftType.I32, 0);
            output.writeI32(this.success);
            output.writeFieldEnd();
        }
        if (this.ouch !== null && this.ouch !== undefined) {
            output.writeFieldBegin('ouch', ThriftType.STRUCT, 1);
            this.ouch.write(output);
            output.writeFieldEnd();
        }
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}

export class Calculator_zip_args {
    constructor(args?) { }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            input.skip(ftype);
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_zip_args');
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}


export class Calculator_zip_result {
    constructor(args?) { }

    read = (input) => {
        input.readStructBegin();
        while (true) {
            var ret = input.readFieldBegin();
            var fname = ret.fname;
            var ftype = ret.ftype;
            var fid = ret.fid;
            if (ftype == ThriftType.STOP) {
                break;
            }
            input.skip(ftype);
            input.readFieldEnd();
        }
        input.readStructEnd();
        return;
    }

    write = (output) => {
        output.writeStructBegin('Calculator_zip_result');
        output.writeFieldStop();
        output.writeStructEnd();
        return;
    }
}


// Clients
export default class CalculatorClient/* extends SharedServiceClient */ {
    public output: any;
    public pClass: any;
    public id: number;
    public reqs: { [key: string]: any }
    constructor(output, pClass) {
        this.output = output;
        this.pClass = pClass;
        this.id = 0;
        this.reqs = {};
    }

    ping = (callback: Function) => {
        if (callback === undefined) {
            let self = this
            return new Promise(function (resolve, reject) {
                self.reqs[self.id] = function (err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                }
                self.send_ping();
            })
        } else {
            this.reqs[this.id] = callback;
            this.send_ping();
        }
    }

    send_ping = function () {
        var output = new this.pClass(this.output);
        output.writeMessageBegin('ping', MessageType.CALL, this.id);
        var args = new Calculator_ping_args();
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }
    recv_ping = function (input, mtype, rseqid) {

        var callback = this.reqs[rseqid] || function () { };
        delete this.reqs[rseqid];
        if (mtype == MessageType.EXCEPTION) {
            var x = new TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        var result = new Calculator_ping_result();
        result.read(input);
        input.readMessageEnd();

        if (null !== result.success) {
            return callback(null, result.success);
        }
        return callback('ping failed: unknown result');
    }

    add = function (num1, num2, callback) {
        if (callback === undefined) {
            var self = this
            return new Promise(function (resolve, reject) {
                self.reqs[self.id] = function (err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                }
                self.send_add(num1, num2);
            })
        } else {
            this.reqs[this.id] = callback;
            this.send_add(num1, num2);
        }
    }

    send_add = function (num1, num2) {
        var output = new this.pClass(this.output);
        output.writeMessageBegin('add', MessageType.CALL, this.id);
        var args = new Calculator_add_args();
        args.num1 = num1;
        args.num2 = num2;
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }

    recv_add = function (input, mtype, rseqid) {
        var callback = this.reqs[rseqid] || function () { };
        delete this.reqs[rseqid];
        if (mtype == MessageType.EXCEPTION) {
            var x = new TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        var result = new Calculator_add_result();
        result.read(input);
        input.readMessageEnd();

        if (null !== result.success) {
            return callback(null, result.success);
        }
        return callback('add failed: unknown result');
    }

    calculate = function (logid, w, callback) {
        if (callback === undefined) {
            var self = this
            return new Promise(function (resolve, reject) {
                self.reqs[self.id] = function (err, result) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(result)
                    }
                }
                self.send_calculate(logid, w);
            })
        } else {
            this.reqs[this.id] = callback;
            this.send_calculate(logid, w);
        }
    }

    send_calculate = function (logid, w, callback) {
        var output = new this.pClass(this.output);
        output.writeMessageBegin('calculate', MessageType.CALL, this.id);
        var args = new Calculator_calculate_args({
            logid,
            w
        });
        args.write(output);
        output.writeMessageEnd();
        return this.output.flush();
    }

    recv_calculate = function (input, mtype, rseqid) {
        var callback = this.reqs[rseqid] || function () { };
        delete this.reqs[rseqid];
        if (mtype == MessageType.EXCEPTION) {
            var x = new TApplicationException();
            x.read(input);
            input.readMessageEnd();
            return callback(x);
        }
        var result = new Calculator_calculate_result();
        result.read(input);
        input.readMessageEnd();

        if (null !== result.ouch) {
            throw result.ouch;
        }
        if (null !== result.success) {
            return callback(null, result.success);
        }
        return callback('calculate failed: unknown result');
    }

    zip = function (callback) {
        this.send_zip(callback)
    }

    send_zip = function (callback) {
        this.output.writeMessageBegin('zip', MessageType.ONEWAY, this.id);
        var args = new Calculator_zip_args();
        args.write(this.output);
        this.output.writeMessageEnd();
        if (callback) {
            var self = this;
            this.output.getTransport().flush(true, function () {
                var result = null;
                try {
                    result = self.recv_zip();
                } catch (e) {
                    result = e;
                }
                callback(result);
            });
        } else {
            return this.output.getTransport().flush();
        }
    }
}
