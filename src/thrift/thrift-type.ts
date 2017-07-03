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

export enum ThriftType {
    STOP = 0,
    VOID = 1,
    BOOL = 2,
    BYTE = 3,
    I08 = 3,
    DOUBLE = 4,
    I16 = 6,
    I32 = 8,
    I64 = 10,
    STRING = 11,
    UTF7 = 11,
    STRUCT = 12,
    MAP = 13,
    SET = 14,
    LIST = 15,
    UTF8 = 16,
    UTF16 = 17
}

export enum MessageType {
    CALL = 1,
    REPLY,
    EXCEPTION,
    ONEWAY
}

export enum TApplicationExceptionType {
    UNKNOWN,
    UNKNOWN_METHOD,
    INVALID_MESSAGE_TYPE,
    WRONG_METHOD_NAME,
    BAD_SEQUENCE_ID,
    MISSING_RESULT,
    INTERNAL_ERROR,
    PROTOCOL_ERROR,
    INVALID_TRANSFORM,
    INVALID_PROTOCOL,
    UNSUPPORTED_CLIENT_TYPE,
    MISSING_SERVICE_CLIENT
}

export enum TProtocolExceptionType {
    UNKNOWN,
    INVALID_DATA,
    NEGATIVE_SIZE,
    SIZE_LIMIT,
    BAD_VERSION,
    NOT_IMPLEMENTED,
    DEPTH_LIMIT
}
