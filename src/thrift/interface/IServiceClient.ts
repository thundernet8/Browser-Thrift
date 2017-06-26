import ITransport from './ITransport'
import IProtocol, { ProtocolClass } from './IProtocol'

interface IServiceClient {
    
}

export interface ServiceClientClass {
    new (transport: ITransport, protocol: ProtocolClass)
}

export default IServiceClient
