import { Buffer } from 'buffer'

interface ITransport {
    flush: (async?: boolean, callback?) => void;

    isOpen: () => boolean;

    open: () => void;

    close: () => void;

    read: (len: number) => string;

    readAll: () => string;

    write: (buf: string) => void;

    getSendBuffer: () => string;

    borrow?: () => {buf: Buffer, readIndex: number, writeIndex: number};

    consume?: (len: number) => void;
}

export default ITransport
