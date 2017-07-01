import { Buffer } from 'buffer'

interface ITransport {

    flush: (async?: boolean, callback?) => void;

    isOpen: () => boolean;

    open: () => void;

    close: () => void;

    read: (len: number) => Buffer|string;

    write: (buf: string) => void;

    borrow?: () => {buf: Buffer, readIndex: number, writeIndex: number};

    consume?: (len: number) => void;

    commitPosition: () => void;

    rollbackPosition: () => void;
}

export interface TransportClass {
    new (flushCallback: any): ITransport;
    receiver: (callback: Function) => Function;
}

export default ITransport
