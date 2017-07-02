import ITransport from './ITransport'
import { MessageType, ThriftType } from "../thrift-type"

interface IProtocolMsgHeader {
    fname: string;
    mtype: MessageType;
    rseqid: number;
}

interface IProtocolFieldHeader {
    fname: string;
    ftype: ThriftType;
    fid: number;
}

interface IProtocol {
    writeMessageBegin: (name: string, messageType: MessageType, seqId: number) => void;

    readMessageBegin: () => IProtocolMsgHeader;

    readFieldBegin: () => IProtocolFieldHeader;

    readFieldEnd: () => void;

    readStructBegin: () => void;

    readStructEnd: () => void;

    readByte: () => number;

    readI16: () => number;

    readI32: () => number;

    readString: () => string;

    skip: (ftype: ThriftType) => IProtocolFieldHeader;
}

export interface ProtocolClass {
    new (transport: ITransport): IProtocol
}

export default IProtocol
