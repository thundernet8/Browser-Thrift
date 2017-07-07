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
import { InputBufferUnderrunError } from "../error";
import * as binaryHelper from "../binary";

export default class TBufferedTransport implements ITransport {
    public onFlush: Function;

    private defaultBufSize = 1024;
    private writeCursor: number = 0;
    private readCursor: number = 0;
    private inBuf: Buffer = new Buffer(this.defaultBufSize);
    private outBuffers: Buffer[] = [];
    private outCount: number = 0;

    static receiver = (callback: any, seqid: number) => {
        let reader = new TBufferedTransport();

        return (data: Buffer) => {
            if (reader.writeCursor + data.length > reader.inBuf.length) {
                let buf = new Buffer(reader.writeCursor + data.length);
                reader.inBuf.copy(buf, 0, 0, reader.writeCursor);
                reader.inBuf = buf;
            }
            data.copy(reader.inBuf, reader.writeCursor, 0);
            reader.writeCursor += data.length;

            callback(reader, seqid);
        };
    };

    constructor(onFlushCb?: Function) {
        this.onFlush = onFlushCb;
    }

    commitPosition = () => {
        let unreadSize = this.writeCursor - this.readCursor;
        let bufSize =
            unreadSize * 2 > this.defaultBufSize
                ? unreadSize * 2
                : this.defaultBufSize;
        let buf = new Buffer(bufSize);
        if (unreadSize > 0) {
            this.inBuf.copy(buf, 0, this.readCursor, this.writeCursor);
        }
        this.readCursor = 0;
        this.writeCursor = unreadSize;
        this.inBuf = buf;
    };

    rollbackPosition = () => {
        this.readCursor = 0;
    };

    isOpen = () => {
        return true;
    };

    open = () => {};

    close = () => {};

    ensureAvaiable = (len: number) => {
        if (this.readCursor + len > this.writeCursor) {
            throw new InputBufferUnderrunError("");
        }
    };

    read = (len: number) => {
        this.ensureAvaiable(len);
        let buf = new Buffer(len);
        this.inBuf.copy(buf, 0, this.readCursor, this.readCursor + len);
        this.readCursor += len;
        return buf;
    };

    readByte = () => {
        this.ensureAvaiable(1);
        return binaryHelper.readByte(this.inBuf[this.readCursor++]);
    };

    readI16 = () => {
        this.ensureAvaiable(2);
        let i16 = binaryHelper.readI16(this.inBuf, this.readCursor);
        this.readCursor += 2;
        return i16;
    };

    readI32 = () => {
        this.ensureAvaiable(4);
        let i32 = binaryHelper.readI32(this.inBuf, this.readCursor);
        this.readCursor += 4;
        return i32;
    };

    readDouble = () => {
        this.ensureAvaiable(8);
        let dob = binaryHelper.readDouble(this.inBuf, this.readCursor);
        this.readCursor += 8;
        return dob;
    };

    readString = (len: number) => {
        this.ensureAvaiable(len);
        let str = this.inBuf.toString(
            "utf8",
            this.readCursor,
            this.readCursor + len
        );
        this.readCursor += len;
        return str;
    };

    borrow = () => {
        return {
            buf: this.inBuf,
            readIndex: this.readCursor,
            writeIndex: this.writeCursor
        };
    };

    consume = (bytesConsumed: number) => {
        this.readCursor += bytesConsumed;
    };

    write = (buf: Buffer | string) => {
        if (typeof buf === "string") {
            buf = new Buffer(buf, "utf8");
        }
        this.outBuffers.push(buf);
        this.outCount += buf.length;
    };

    flush = () => {
        if (this.outCount < 1) {
            return;
        }

        let msg = new Buffer(this.outCount);
        let pos = 0;
        this.outBuffers.forEach(buf => {
            buf.copy(msg, pos, 0);
            pos += buf.length;
        });

        if (this.onFlush) {
            this.onFlush(msg);
        }

        this.outBuffers = [];
        this.outCount = 0;
    };
}
