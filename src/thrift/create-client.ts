import IServiceClient, { ServiceClientClass } from "./interface/IServiceClient"
import IConnection from "./interface/IConnection"

const createClient = (() => {
    let clientId = 0
    return (ServiceClient: ServiceClientClass, connection: IConnection): IServiceClient => {
        clientId++
        let flushCallback = (buf: any) => {
            connection.write(buf)
        }

        let transport = new connection.transport(flushCallback)
        let client = new ServiceClient(transport, connection.protocol)
        client.id = clientId
        connection.clients[clientId] = client
        console.log(client)
        return client
    }
})()

export default createClient
