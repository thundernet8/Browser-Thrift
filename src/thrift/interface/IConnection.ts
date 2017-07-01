import { TransportClass } from './ITransport'
import IServiceClient from "./IServiceClient"
import { ProtocolClass } from "./IProtocol"

interface IConnection {
    clients: {[key: string]: IServiceClient};

    transport: TransportClass;

    protocol: ProtocolClass;

    write: (buf: Buffer) => void;

    isOpen: () => boolean;

    open()

    close()
}

export default IConnection
