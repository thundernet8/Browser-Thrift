import TXHRTransport from "./transport/xhr"
import TBufferedTransport from "./transport/buffer"

import TJSONProtocol from "./protocol/json"

import createWSConnection from "./connection/ws"
import createClient from "./create-client"

export default {
    Protocol: TJSONProtocol,
    TJSONProtocol,
    TXHRTransport,
    TBufferedTransport,
    createWSConnection,
    createClient
}