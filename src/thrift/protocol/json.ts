/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import ITransport from "../interface/ITransport";
import IProtocol from "../interface/IProtocol";
import { ThriftType, MessageType } from "../thrift-type";
import { Buffer } from "buffer";
import { InputBufferUnderrunError } from "../error";

export default class TJSONProtocol implements IProtocol {
    private tstack: any[];
    private tpos: number[];
    private rstack: any[];
    private rpos: number[];
    private wobj: any[];
    private wbuf: string;
    private robj: any;
    private trans: ITransport;

    static Type = {
        [ThriftType.BOOL]: '"tf"',
        [ThriftType.BYTE]: '"i8"',
        [ThriftType.I16]: '"i16"',
        [ThriftType.I32]: '"i32"',
        [ThriftType.I64]: '"i64"',
        [ThriftType.DOUBLE]: '"dbl"',
        [ThriftType.STRUCT]: '"rec"',
        [ThriftType.STRING]: '"str"',
        [ThriftType.MAP]: '"map"',
        [ThriftType.LIST]: '"lst"',
        [ThriftType.SET]: '"set"'
    };

    static RType = {
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

    static Version = 1;

    constructor(trans: ITransport) {
        this.tstack = [];
        this.tpos = [];
        this.trans = trans;
    }

    flush = () => {
        this.writeToTransportIfStackIsFlushable();
        return this.trans.flush();
    };

    writeToTransportIfStackIsFlushable = () => {
        if (this.tstack.length === 1) {
            this.trans.write(this.tstack.pop());
        }
    };

    writeMessageBegin = (
        name: string,
        messageType: MessageType,
        seqId: number
    ) => {
        this.tstack.push([
            TJSONProtocol.Version,
            `"${name}"`,
            messageType,
            seqId
        ]);
    };

    writeMessageEnd = () => {
        let obj = this.tstack.pop();

        this.wobj = this.tstack.pop();
        this.wobj.push(obj);

        this.wbuf = `[${this.wobj.join(",")}]`;

        this.trans.write(this.wbuf);
    };

    writeStructBegin = (name: string) => {
        this.tpos.push(this.tstack.length);
        this.tstack.push({});
    };

    writeStructEnd = () => {
        let p = this.tpos.pop();
        let struct = this.tstack[p];
        let str = "{";
        let first = true;
        for (let key in struct) {
            if (first) {
                first = false;
            } else {
                str += ",";
            }
            str += `${key}:${struct[key]}`;
        }
        str += "}";
        this.tstack[p] = str;

        this.writeToTransportIfStackIsFlushable();
    };

    writeFieldBegin = (
        name: string,
        fieldType: ThriftType,
        fieldId: number
    ) => {
        this.tpos.push(this.tstack.length);
        this.tstack.push({
            fieldId: `"${fieldId}"`,
            fieldType: TJSONProtocol.Type[fieldType]
        });
    };

    writeFieldEnd = () => {
        let value = this.tstack.pop();
        let fieldInfo = this.tstack.pop();

        if (":" + value === ":[object Object]") {
            this.tstack[this.tstack.length - 1][
                fieldInfo.fieldId
            ] = `{${fieldInfo.fieldType}:${JSON.stringify(value)}}`;
        } else {
            this.tstack[this.tstack.length - 1][
                fieldInfo.fieldId
            ] = `{${fieldInfo.fieldType}:${value}}`;
        }
        this.tpos.pop();

        this.writeToTransportIfStackIsFlushable();
    };

    writeFieldStop = () => {};

    writeMapBegin = (
        keyType: ThriftType,
        valType: ThriftType,
        size: number
    ) => {
        this.tpos.push(this.tstack.length);
        this.tstack.push([
            TJSONProtocol.Type[keyType],
            TJSONProtocol.Type[valType],
            0
        ]);
    };

    writeMapEnd = () => {
        let p = this.tpos.pop();

        if (p === this.tstack.length) {
            return;
        }

        if ((this.tstack.length - p - 1) % 2 !== 0) {
            this.tstack.push("");
        }

        let size = (this.tstack.length - p - 1) / 2;
        this.tstack[p][this.tstack[p].length - 1] = size;

        let map = "}";
        let first = true;
        while (this.tstack.length > p + 1) {
            let v = this.tstack.pop();
            let k = this.tstack.pop();
            if (first) {
                first = false;
            } else {
                map = "," + map;
            }

            if (!isNaN(k)) {
                k = `"${k}"`;
            }

            map = `${k}:${v}${map}`;
        }

        map = "{" + map;

        this.tstack[p].push(map);
        this.tstack[p] = `[${this.tstack[p].join(",")}]`;

        this.writeToTransportIfStackIsFlushable();
    };

    writeListBegin = (elemType: ThriftType, size: number) => {
        this.tpos.push(this.tstack.length);
        this.tstack.push([TJSONProtocol.Type[elemType], size]);
    };

    writeListEnd = () => {
        let p = this.tpos.pop();

        while (this.tstack.length > p + 1) {
            let tmpVal = this.tstack[p + 1];
            this.tstack.splice(p + 1, 1);
            this.tstack[p].push(tmpVal);
        }

        this.tstack[p] = `[${this.tstack[p].join(",")}]`;

        this.writeToTransportIfStackIsFlushable();
    };

    writeSetBegin = (elemType: ThriftType, size: number) => {
        this.tpos.push(this.tstack.length);
        this.tstack.push([TJSONProtocol.Type[elemType], size]);
    };

    writeSetEnd = () => {
        let p = this.tpos.pop();

        while (this.tstack.length > p + 1) {
            let tmpVal = this.tstack[p + 1];
            this.tstack.splice(p + 1, 1);
            this.tstack[p].push(tmpVal);
        }

        this.tstack[p] = `[${this.tstack[p].join(",")}]`;

        this.writeToTransportIfStackIsFlushable();
    };

    writeBool = (bool: boolean) => {
        this.tstack.push(bool ? 1 : 0);
    };

    writeByte = (byte: number) => {
        this.tstack.push(byte);
    };

    writeI16 = (i16: number) => {
        this.tstack.push(i16);
    };

    writeI32 = (i32: number) => {
        this.tstack.push(i32);
    };

    writeI64 = (i64: number) => {
        this.tstack.push(i64);
    };

    writeDouble = (dub: number) => {
        this.tstack.push(dub);
    };

    writeString = (arg: string | Buffer) => {
        if (arg === null) {
            this.tstack.push(null);
        } else {
            let str: string;
            if (typeof arg === "string") {
                str = arg;
            } else if (arg instanceof Buffer) {
                str = arg.toString("utf8");
            } else {
                throw new Error(
                    `writeString called without a string/Buffer argument: ${arg}`
                );
            }

            let escapedString = "";
            for (let i = 0; i < str.length; i++) {
                let ch = str.charAt(i);
                if (ch === '"') {
                    escapedString += '\\"';
                } else if (ch === "\\") {
                    escapedString += "\\\\";
                } else if (ch === "\b") {
                    escapedString += "\\b";
                } else if (ch === "\f") {
                    escapedString += "\\f";
                } else if (ch === "\n") {
                    escapedString += "\\n";
                } else if (ch === "\r") {
                    escapedString += "\\r";
                } else if (ch === "\t") {
                    escapedString += "\\t";
                } else {
                    escapedString += ch;
                }
            }
            this.tstack.push(`"${escapedString}"`);
        }
    };

    writeBinary = (arg: string | Buffer) => {
        let buf: Buffer;
        if (typeof arg === "string") {
            buf = new Buffer(arg, "binary");
        } else if (
            arg instanceof Buffer ||
            Object.prototype.toString.call(arg) === "[object Uint8Array]"
        ) {
            buf = arg;
        } else {
            throw new Error(
                `writeBinary called without a string/Buffer argument: ${arg}`
            );
        }
        this.tstack.push(`"${buf.toString("base64")}"`);
    };

    readMessageBegin = () => {
        this.rstack = [];
        this.rpos = [];

        let transBuf = this.trans.borrow();
        if (transBuf.readIndex >= transBuf.writeIndex) {
            throw new InputBufferUnderrunError();
        }
        let cursor = transBuf.readIndex;

        if (transBuf.buf[cursor] !== 0x5b) {
            //[
            throw new Error("Malformed JSON input, no opening bracket");
        }

        cursor++;
        let openBracketCount = 1;
        let inString = false;
        for (; cursor < transBuf.writeIndex; cursor++) {
            let chr = transBuf.buf[cursor];
            if (inString) {
                if (chr === 0x22) {
                    //"
                    inString = false;
                } else if (chr === 0x5c) {
                    //\
                    //escaped character, skip
                    cursor += 1;
                }
            } else {
                if (chr === 0x5b) {
                    //[
                    openBracketCount += 1;
                } else if (chr === 0x5d) {
                    //]
                    openBracketCount -= 1;
                    if (openBracketCount === 0) {
                        //end of json message detected
                        break;
                    }
                } else if (chr === 0x22) {
                    //"
                    inString = true;
                }
            }
        }

        if (openBracketCount !== 0) {
            // Missing closing bracket. Can be buffer underrun.
            throw new InputBufferUnderrunError();
        }

        //Reconstitute the JSON object and conume the necessary bytes
        this.robj = JSON.parse(
            transBuf.buf.slice(transBuf.readIndex, cursor + 1).toString()
        );
        this.trans.consume(cursor + 1 - transBuf.readIndex);

        //Verify the protocol version
        let version = this.robj.shift();
        if (version != TJSONProtocol.Version) {
            throw new Error("Wrong thrift protocol version: " + version);
        }

        //Objectify the thrift message {name/type/sequence-number} for return
        // and then save the JSON object in rstack
        let r: any = {};
        r.fname = this.robj.shift();
        r.mtype = this.robj.shift();
        r.rseqid = this.robj.shift();
        this.rstack.push(this.robj.shift());
        return r;
    };

    readMessageEnd = () => {};

    readStructBegin = () => {
        let r: any = {};
        r.fname = "";

        //incase this is an array of structs
        if (this.rstack[this.rstack.length - 1] instanceof Array) {
            this.rstack.push(this.rstack[this.rstack.length - 1].shift());
        }

        return r;
    };

    readStructEnd = () => {
        this.rstack.pop();
    };

    readFieldBegin = () => {
        let r: any = {};

        let fid = -1;
        let ftype = ThriftType.STOP;

        //get a fieldId
        for (var f in this.rstack[this.rstack.length - 1]) {
            if (f === null) {
                continue;
            }

            fid = parseInt(f, 10);
            this.rpos.push(this.rstack.length);

            let field = this.rstack[this.rstack.length - 1][fid];

            //remove so we don't see it again
            delete this.rstack[this.rstack.length - 1][fid];

            this.rstack.push(field);

            break;
        }

        if (fid != -1) {
            //should only be 1 of these but this is the only
            //way to match a key
            for (var i in this.rstack[this.rstack.length - 1]) {
                if (TJSONProtocol.RType[i] === null) {
                    continue;
                }

                ftype = TJSONProtocol.RType[i];
                this.rstack[this.rstack.length - 1] = this.rstack[
                    this.rstack.length - 1
                ][i];
            }
        }

        r.fname = "";
        r.ftype = ftype;
        r.fid = fid;

        return r;
    };

    readFieldEnd = () => {
        let p = this.rpos.pop();

        while (this.rstack.length > p) {
            this.rstack.pop();
        }
    };

    readMapBegin = () => {
        let map = this.rstack.pop();
        let first = map.shift();
        if (first instanceof Array) {
            this.rstack.push(map);
            map = first;
            first = map.shift();
        }

        var r: any = {};
        r.ktype = TJSONProtocol.RType[first];
        r.vtype = TJSONProtocol.RType[map.shift()];
        r.size = map.shift();

        this.rpos.push(this.rstack.length);
        this.rstack.push(map.shift());

        return r;
    };

    readMapEnd = () => {
        this.readFieldEnd();
    };

    readListBegin = () => {
        let list = this.rstack[this.rstack.length - 1];

        let r: any = {};
        r.etype = TJSONProtocol.RType[list.shift()];
        r.size = list.shift();

        this.rpos.push(this.rstack.length);
        this.rstack.push(list.shift());

        return r;
    };

    readListEnd = () => {
        let p = this.rpos.pop() - 2;
        let st = this.rstack;
        st.pop();
        if (st instanceof Array && st.length > p && st[p].length > 0) {
            st.push(st[p].shift());
        }
    };

    readSetBegin = () => {
        return this.readListBegin();
    };

    readSetEnd = () => {
        return this.readListEnd();
    };

    readBool = () => {
        return this.readValue() === "1";
    };

    readByte = () => {
        return this.readI32();
    };

    readI16 = () => {
        return this.readI32();
    };

    readI32 = () => {
        return +this.readValue();
    };

    readValue = (f?) => {
        if (f === undefined) {
            f = this.rstack[this.rstack.length - 1];
        }

        let r: any = {};

        if (f instanceof Array) {
            if (f.length === 0) {
                r.value = undefined;
            } else {
                r.value = f.shift();
            }
        } else if (f instanceof Object) {
            for (let i in f) {
                if (i === null) {
                    continue;
                }
                this.rstack.push(f[i]);
                delete f[i];

                r.value = i;
                break;
            }
        } else {
            r.value = f;
            this.rstack.pop();
        }

        return r.value;
    };

    readI64 = () => {
        return this.readI32(); // TODO
    };

    readDouble = () => {
        return this.readI32();
    };

    readBinary = () => {
        return new Buffer(this.readValue(), "base64");
    };

    readString = () => {
        return this.readValue();
    };

    getTransport = () => {
        return this.trans;
    };

    skip = (type: ThriftType) => {
        let ret, i;
        switch (type) {
            case ThriftType.STOP:
                return null;

            case ThriftType.BOOL:
                return this.readBool();

            case ThriftType.BYTE:
                return this.readByte();

            case ThriftType.I16:
                return this.readI16();

            case ThriftType.I32:
                return this.readI32();

            case ThriftType.I64:
                return this.readI64();

            case ThriftType.DOUBLE:
                return this.readDouble();

            case ThriftType.STRING:
                return this.readString();

            case ThriftType.STRUCT:
                this.readStructBegin();
                while (true) {
                    ret = this.readFieldBegin();
                    if (ret.ftype == ThriftType.STOP) {
                        break;
                    }
                    this.skip(ret.ftype);
                    this.readFieldEnd();
                }
                this.readStructEnd();
                return null;

            case ThriftType.MAP:
                ret = this.readMapBegin();
                for (i = 0; i < ret.size; i++) {
                    if (i > 0) {
                        if (
                            this.rstack.length >
                            this.rpos[this.rpos.length - 1] + 1
                        ) {
                            this.rstack.pop();
                        }
                    }
                    this.skip(ret.ktype);
                    this.skip(ret.vtype);
                }
                this.readMapEnd();
                return null;

            case ThriftType.SET:
                ret = this.readSetBegin();
                for (i = 0; i < ret.size; i++) {
                    this.skip(ret.etype);
                }
                this.readSetEnd();
                return null;

            case ThriftType.LIST:
                ret = this.readListBegin();
                for (i = 0; i < ret.size; i++) {
                    this.skip(ret.etype);
                }
                this.readListEnd();
                return null;
        }
    };
}
