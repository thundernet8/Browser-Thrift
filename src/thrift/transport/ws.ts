import ITransport from '../interface/ITransport'
import IServiceClient from '../interface/IServiceClient'

export default class TWebSocketTransport implements ITransport {
    private url: string;
    public socket: WebSocket = null;
    private callbacks: any[] = [];
    private send_pending: any[] = [];
    private send_buf: string = '';
    private recv_buf: string = '';
    private recv_buf_sz: number = 0;
    private rb_wpos: number = 0;
    private rb_rpos: number = 0;
    private wpos: number;
    private rpos: number;
    public client: IServiceClient;

    constructor (url: string) {
        this.reset(url)
    }

    private reset = (url: string) => {
        this.url = url
        this.socket = null
        this.callbacks = []
        this.send_pending = []
        this.send_buf = ''
        this.recv_buf = ''
        this.rb_wpos = 0
        this.rb_rpos = 0
    }

    flush = (async?: boolean, callback?: any): void => {
        let self = this
        if (this.isOpen()) {
            this.socket.send(this.send_buf)
            this.callbacks.push((() => {
                let clientCallback = callback
                return (msg) => {
                    self.setRecvBuffer(msg)
                    clientCallback()
                }
            })())
        } else {
            this.send_pending.push({
                buf: this.send_buf,
                cb: callback
            })
        }
    }

    isOpen = () => {
        return this.socket && this.socket.readyState === this.socket.OPEN
    }

    _onOpen = () => {
        let self = this
        if (this.send_pending.length > 0) {
            this.send_pending.forEach(elem => {
                this.socket.send(elem.buf)
                this.callbacks.push((() => {
                    let clientCallback = elem.cb
                    return (msg) => {
                        self.setRecvBuffer(msg)
                        clientCallback()
                    }
                })())
            })

            this.send_pending = []
        }
    }

    _onClose = () => {
        this.reset(this.url)
    }

    _onMessage = (evt) => {
        if (this.callbacks.length) {
            this.callbacks.shift()(evt.data)
        }
    }

    _onError = (evt) => {
        console.log(`Thrift WebSocket Error: ${evt.toString()}`)
        this.socket.close()
    }

    setRecvBuffer = (buf: string) => {
        this.recv_buf = buf
        this.recv_buf_sz = this.recv_buf.length
        this.wpos = this.recv_buf.length
        this.rpos = 0
    }

    public open = () => {
        if (this.socket && this.socket.readyState !== this.socket.CLOSED) {
            return
        }

        this.socket = new WebSocket(this.url) // TODO more options, e.g binaryType
        this.socket.onopen = this._onOpen
        this.socket.onmessage = this._onMessage
        this.socket.onerror = this._onError
        this.socket.onclose = this._onClose
    }

    public close = () => {
        this.socket.close()
    }

    public read = (len: number) => {
        let avail = this.wpos - this.rpos

        if (avail === 0) {
            return ''
        }

        let give = len

        if (avail < len) {
            give = avail
        }

        let ret = this.recv_buf.substr(this.rpos, give)
        this.rpos += give

        return ret
    }

    public readAll = () => {
        return this.recv_buf
    }

    public write = (buf: string) => {
        this.send_buf = buf
    }

    public getSendBuffer = () => {
        return this.send_buf
    }
}