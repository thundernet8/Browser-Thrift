import { EventEmitter } from 'events'
import TWebSocketTransport from '../transport/ws'
import ITransport, { TransportClass } from '../interface/ITransport'
import TJSONProtocol from '../protocol/json'
import { ProtocolClass } from '../interface/IProtocol'
import { Buffer } from 'buffer'
import IServiceClient, { ServiceClientClass } from '../interface/IServiceClient'
import IConnection from '../interface/IConnection'

export default class WSConnection extends EventEmitter {

    private host: string;

    private port: number;

    private secure: boolean;

    public transport: TransportClass;

    public protocol: ProtocolClass;

    private path: string;

    private send_pending: any[] = [];

    private seqId2Service: any = {};

    private socket: WebSocket;

    public client: IServiceClient;

    constructor (host, port, options) {
        super()

        this.secure = !!options.secure || false
        this.transport = options.transport || TWebSocketTransport
        this.protocol = options.protocol || TJSONProtocol
        this.path = options.path || '/'
    }

    uri = () => {
        let scheme = this.secure ? 'wss' : 'ws'
        let port = ''
        let path = this.path || '/'
        let host = this.host

        if (this.port && (('wss' === scheme && this.port !== 443) ||
        ('ws' === scheme && this.port != 80))) {
            port = ':' + this.port
        }

        return scheme + '://' + host + port + path
    }

    _reset = () => {
        this.socket = null
        this.send_pending = []
    }

    _onOpen = () => {
        this.emit('open')
        if (this.send_pending.length > 0) {
            this.send_pending.forEach(data => {
                this.socket.send(data)
            })
        }
    }

    _onClose = () => {
        this.emit('close')
        this._reset()
    }

    _onData = data => {
        if (Object.prototype.toString.call(data) === '[object ArrayBuffer') {
            data = new Uint8Array(data)
        }

        let buf = new Buffer(data)

        // this.transport.recevier(this._decodeCallback.bind(this))(buf)
    }

    _onMessage = evt => {
        this._onData(evt.data)
    }

    _onError = evt => {
        this.emit('error', evt)
        this.socket.close()
    }

    isOpen = () => {
        return this.socket && this.socket.readyState === this.socket.OPEN
    }

    open = () => {
        if (this.socket && this.socket.readyState !== this.socket.CLOSED) {
            return
        }

        this.socket = new WebSocket(this.uri())
        this.socket.binaryType = 'arraybuffer'
        this.socket.onopen = this._onOpen
        this.socket.onmessage = this._onMessage
        this.socket.onerror = this._onError
        this.socket.onclose = this._onClose
    }

    close = () => {
        this.socket.close()
    }

    write = (data: any, seqid?: number) => {
        if (this.isOpen()) {
            this.socket.send(data)
        } else {
            this.send_pending.push(data)
        }
    }
}

const createWSConnection = (host, port, options) => {
    return new WSConnection(host, port, options)
}

const createWSClient = (ServiceClient: ServiceClientClass, connection: WSConnection): IServiceClient => {
    let flushCallback = (buf: any, seqid: number) => {
        connection.write(buf, seqid)
    }
    let transport = new connection.transport(flushCallback)
    let client = new ServiceClient(transport, connection.protocol)

    transport.client = client
    connection.client = client

    return client
}