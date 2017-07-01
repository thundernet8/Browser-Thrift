import ITransport from './ITransport'
import IProtocol, { ProtocolClass } from './IProtocol'

interface IServiceClient {
    reqs: Function[];
    id: number;
}

export interface ServiceClientClass {
    new (transport: ITransport, protocol: ProtocolClass): IServiceClient;
}

export default IServiceClient
