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

class XHRConnection extends EventEmitter {

    private host: string;

    private port: number;

    private secure: boolean;

    public transport: TransportClass;

    public protocol: ProtocolClass;

    private headers: any;

    private path: string;

    private seqId2Service: any = {};

    public clients: {[key: string]: IServiceClient};

    constructor (host: string, port: number, options: any = {}) {
        super()
        this.host = host
        this.port = port
        this.secure = !!options.secure || false
        this.transport = options.transport || TBufferedTransport
        this.protocol = options.protocol || TJSONProtocol
        this.headers = options.headers || {}
        this.path = options.path || '/'
        this.clients = {}
    }

    uri = () => {
        let scheme = this.secure ? 'https' : 'http'
        let port = ''
        let path = this.path || '/'
        let host = this.host

        if (this.port && (('https' === scheme && this.port !== 443) ||
        ('http' === scheme && this.port != 80))) {
            port = ':' + this.port
        }

        return scheme + '://' + host + port + path
    }

    getXmlHttpRequestObject = (): XMLHttpRequest|ActiveXObject => {
        try {
            return new XMLHttpRequest()
        } catch (e) {}

        try {
            return new ActiveXObject('Msxml2.XMLHTTP')
        } catch (e) {}

        try {
            return new ActiveXObject('Microsoft.XMLHTTP')
        } catch (e) {}

        throw new Error('Your browser does not support XHR.')
    }

    _onOpen = () => {}

    _onClose = () => {}

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
        this.emit("error", evt)
    }

    isOpen = () => {
        return true
    }

    open = () => {}

    xhr = (data) => {
        let xreq: XMLHttpRequest = this.getXmlHttpRequestObject() as XMLHttpRequest
        if (xreq["overrideMimeType"]) {
            xreq["overrideMimeType"]("application/json")
        }

        xreq.onreadystatechange = () => {
            if (xreq.readyState === 4 && xreq.status === 200) {
                this._onData(xreq.responseText)
            } else if (xreq.readyState === 4) {
                this._onError(new Error(xreq.statusText))
            }
        }

        xreq.open("POST", this.uri(), true)

        Object.keys(this.headers).forEach(headerKey => {
            xreq.setRequestHeader(headerKey, this.headers[headerKey])
        })

        xreq.send(data)
    }

    close = () => {}

    write = (data: any) => {
        this.xhr(data)
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

const createXHRConnection = (host, port, options) => {
    return new XHRConnection(host, port, options)
}

export default createXHRConnection