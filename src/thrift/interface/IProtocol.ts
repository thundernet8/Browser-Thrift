import ITransport from "./ITransport";
import { MessageType, ThriftType } from "../thrift-type";

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
  readMessageBegin: () => IProtocolMsgHeader;

  readFieldBegin: () => IProtocolFieldHeader;

  readFieldEnd: () => void;

  readStructBegin: () => void;

  readStructEnd: () => void;

  readBool: () => boolean;

  readByte: () => number;

  readI16: () => number;

  readI32: () => number;

  readI64: () => number;

  readDouble: () => number;

  readBinary: () => string | Buffer;

  readString: () => string;

  writeMessageBegin: (
    name: string,
    messageType: MessageType,
    seqId: number
  ) => void;

  writeMessageEnd: () => void;

  writeStructBegin: (struct: string) => void;

  writeStructEnd: () => void;

  writeFieldBegin: (field: string, type: ThriftType, seq: number) => void;

  writeFieldEnd: () => void;

  writeFieldStop: () => void;

  writeBool: (bool: boolean) => void;

  writeByte: (byte: number) => void;

  writeI16: (i16: number) => void;

  writeI32: (i32: number) => void;

  writeI64: (i64: number) => void;

  writeDouble: (dub: number) => void;

  writeString: (str: string | Buffer) => void;

  writeBinary: (arg: string | Buffer) => void;

  skip: (ftype: ThriftType) => IProtocolFieldHeader;
}

export interface ProtocolClass {
  new (transport: ITransport): IProtocol;
}

export default IProtocol;
