import ITransport from './ITransport'

interface IConnection {
    transport: ITransport;

    isOpen: () => boolean;

    open()

    close()
}

export default IConnection
