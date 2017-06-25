import TXHRTransport from './transport/xhr'
import TWebSocketTransport from './transport/ws'

import TJSONProtocol from './protocol/json'

export default {
    Protocol: TJSONProtocol,
    TJSONProtocol,
    TXHRTransport,
    TWebSocketTransport
}