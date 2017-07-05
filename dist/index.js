import TBufferedTransport from "./transport/buffer";
import TJSONProtocol from "./protocol/json";
import createWSConnection from "./connection/ws";
import createXHRConnection from "./connection/xhr";
import createClient from "./create-client";
import { ThriftType, MessageType, TApplicationExceptionType, TProtocolExceptionType } from "./thrift-type";
import { TApplicationException, TException } from "./error";
export default {
    Protocol: TJSONProtocol,
    TJSONProtocol: TJSONProtocol,
    TBufferedTransport: TBufferedTransport,
    createWSConnection: createWSConnection,
    createXHRConnection: createXHRConnection,
    createClient: createClient,
    ThriftType: ThriftType,
    MessageType: MessageType,
    TApplicationExceptionType: TApplicationExceptionType,
    TProtocolExceptionType: TProtocolExceptionType,
    TApplicationException: TApplicationException,
    TException: TException
};
