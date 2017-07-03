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

import TBufferedTransport from "./transport/buffer"

import TJSONProtocol from "./protocol/json"

import createWSConnection from "./connection/ws"
import createXHRConnection from "./connection/xhr"
import createClient from "./create-client"

import { ThriftType, MessageType, TApplicationExceptionType} from "./thrift-type"

import { TApplicationException, TException } from "./error"

export default {
    Protocol: TJSONProtocol,
    TJSONProtocol,
    TBufferedTransport,
    createWSConnection,
    createXHRConnection,
    createClient,
    ThriftType,
    MessageType,
    TApplicationExceptionType,
    TApplicationException,
    TException
}