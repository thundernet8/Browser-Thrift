import ITransport from './ITransport'

interface IProtocol {

}

export interface ProtocolClass {
    new (transport: ITransport): IProtocol
}

export default IProtocol
