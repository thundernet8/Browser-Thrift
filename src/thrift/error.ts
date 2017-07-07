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

import { TApplicationExceptionType, ThriftType } from "./thrift-type";
import { inherits } from "util";
import IProtocol from "./interface/IProtocol";

// https://stackoverflow.com/questions/33870684/why-doesnt-instanceof-work-on-instances-of-error-subclasses-under-babel-node
// https://github.com/thundernet8/Blog/issues/1
// export class InputBufferUnderrunError extends Error {
//     constructor (message?: string) {
//         super(message)
//         this.name = InputBufferUnderrunError.name
//     }
// }

export function InputBufferUnderrunError(message?: string) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}
inherits(InputBufferUnderrunError, Error);

export class TException {
    private message: string;
    public name: string;

    constructor(message?: string) {
        this.message = message;
        this.name = TException.name;
    }

    getMessage = () => {
        return this.message;
    };
}
inherits(TException, Error);

export class TApplicationException extends TException {
    type: TApplicationExceptionType;
    name: string;
    constructor(type?: TApplicationExceptionType, message?: string) {
        super(message);
        this.name = TApplicationException.name;
        this.type = TApplicationExceptionType.UNKNOWN;
    }

    read = function(input: IProtocol) {
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
                    } else {
                        ret = input.skip(ret.ftype);
                    }
                    break;
                case 2:
                    if (ret.ftype == ThriftType.I32) {
                        this.code = input.readI32();
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
    };

    write = function(output) {
        output.writeStructBegin("TApplicationException");

        if (this.message) {
            output.writeFieldBegin("message", ThriftType.STRING, 1);
            output.writeString(this.getMessage());
            output.writeFieldEnd();
        }

        if (this.code) {
            output.writeFieldBegin("type", ThriftType.I32, 2);
            output.writeI32(this.code);
            output.writeFieldEnd();
        }

        output.writeFieldStop();
        output.writeStructEnd();
    };

    getCode = function() {
        return this.code;
    };
}
