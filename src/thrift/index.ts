import TBufferedTransport from "./transport/buffer"

import TJSONProtocol from "./protocol/json"

import createWSConnection from "./connection/ws"
import createXHRConnection from "./connection/xhr"
import createClient from "./create-client"

export default {
    Protocol: TJSONProtocol,
    TJSONProtocol,
    TBufferedTransport,
    createWSConnection,
    createXHRConnection,
    createClient
}