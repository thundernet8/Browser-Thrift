import { EventEmitter } from 'events'
import { Buffer } from 'buffer'
import TBufferedTransport from '../transport/buffer'
import TJSONProtocol from '../protocol/json'
import { ProtocolClass } from '../interface/IProtocol'
import IConnection from '../interface/IConnection'
import ITransport, { TransportClass } from '../interface/ITransport'
import IServiceClient, { ServiceClientClass } from '../interface/IServiceClient'
import { TApplicationExceptionType } from "../thrift-type"
import { TApplicationException, InputBufferUnderrunError } from "../error"

class WSConnection extends EventEmitter {

    private host: string;

    private port: number;

    private secure: boolean;

    public transport: TransportClass;

    public protocol: ProtocolClass;

    private path: string;

    private send_pending: any[] = [];

    private seqId2Service: any = {};

    private socket: WebSocket;

    public clients: {[key: string]: IServiceClient};

    constructor (host, port, options) {
        super()
        this.host = host
        this.port = port
        this.secure = !!options.secure || false
        this.transport = options.transport || TBufferedTransport
        this.protocol = options.protocol || TJSONProtocol
        this.path = options.path || '/'
        this.clients = {}
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

        this.transport.receiver(this._decodeCallback.bind(this))(buf)
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

    write = (data: any) => {
        if (this.isOpen()) {
            this.socket.send(data)
        } else {
            this.send_pending.push(data)
        }
    }

    _decodeCallback = (trans: ITransport) => {
        let proto = new this.protocol(trans)
        try {
            while (true) {
                let header = proto.readMessageBegin()
                let client = this.clients[header.rseqid] || null
                if (!client) {
                    this.emit("error", new TApplicationException(TApplicationExceptionType.MISSING_SERVICE_CLIENT, "Received a response to an unknown service client"))
                }
                delete this.clients[header.rseqid]

                let clientWrappedCb = (err: Error, success: any) => {
                    trans.commitPosition()
                    let clientCb = client.reqs[header.rseqid]
                    delete client.reqs[header.rseqid]
                    if (clientCb) {
                        clientCb(err, success)
                    }
                }
                if (client["recv_" + header.fname]) {
                    let dummy_seqid = header.rseqid * -1
                    client.reqs[dummy_seqid] = clientWrappedCb
                    client["recv_" + header.fname](proto, header.mtype, dummy_seqid)
                } else {
                    this.emit("error", new TApplicationException(TApplicationExceptionType.WRONG_METHOD_NAME, "Received a response to an unknown RPC function"))
                }
            }
        } catch (e) {
            if (e instanceof InputBufferUnderrunError) {
                trans.rollbackPosition()
            } else {
                throw e
            }
        }
    }
}

const createWSConnection = (host, port, options) => {
    return new WSConnection(host, port, options)
}

export default createWSConnection