import ITransport from './ITransport'
import { MessageType } from "../thrift-type"

interface IProtocolMsgHeader {
    fname: string;
    mtype: MessageType;
    rseqid: number;
}

interface IProtocol {
    writeMessageBegin: (name: string, messageType: MessageType, seqId: number) => void;

    readMessageBegin: () => IProtocolMsgHeader;
}

export interface ProtocolClass {
    new (transport: ITransport): IProtocol
}

export default IProtocol
