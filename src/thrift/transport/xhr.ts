import ITransport from '../interface/ITransport'
import IServiceClient from '../interface/IServiceClient'

export default class TXHRTransport implements ITransport {
    private url: string;
    private wpos: number = 0;
    private rpos: number = 0;
    private useCORS: boolean;
    private customHeaders: any;
    private send_buf: string = '';
    private recv_buf: string = '';
    private recv_buf_sz: number = 0;
    public client: IServiceClient;

    constructor (url, options?) {
        this.url = url
        this.useCORS = options && options.useCORS
        this.customHeaders = options ? (options.customHeaders || {}) : {}
    }

    getXmlHttpRequestObject = () => {
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

    flush = (async?: boolean, callback?: any) => {
        if ((async && !callback) || this.url === undefined || this.url === '') {
            return this.send_buf
        }

        let xreq = this.getXmlHttpRequestObject()

        if (xreq.overrideMimeType) {
            xreq.overrideMimeType('application/vnd.apache.thrift.json;charset=utf-8')
        }

        if (callback) {
            let self = this
            xreq.onreadystatechange = (() => {
                let clientCallback = callback
                return () => {
                    if (xreq.readyState === 4 && xreq.status === 200) {
                        self.setRecvBuffer(xreq.responseText)
                        clientCallback()
                    }
                }
            })()

            xreq.onerror = (() => {
                let clientCallback = callback
                return () => {
                    clientCallback()
                }
            })()
        }

        xreq.open('POST', this.url, !!async)

        Object.keys(this.customHeaders).forEach(prop => {
            xreq.setRequestHeader && xreq.setRequestHeader(prop, this.customHeaders[prop])
        })

        if (xreq.setRequestHeader) {
            xreq.setRequestHeader('Accept', 'application/vnd.apache.thrift.json; charset=utf-8')
            xreq.setRequestHeader('Content-Type', 'application/vnd.apache.thrift.json; charset=utf-8')
        }

        xreq.send(this.send_buf)
        if (async && callback) {
            return
        }

        if (xreq.readyState !== 4) {
            throw new Error(`encountered an unknown ajax ready state: ${xreq.readyState}`)
        }

        if (xreq.status !== 200) {
            throw new Error(`encountered a unknown request status: ${xreq.status}`)
        }

        this.recv_buf = xreq.responseText
        this.recv_buf_sz = this.recv_buf.length
        this.wpos = this.recv_buf.length
        this.rpos = 0
    }

    setRecvBuffer = (buf: string) => {
        this.recv_buf = buf
        this.recv_buf_sz = this.recv_buf.length
        this.wpos = this.recv_buf.length
        this.rpos = 0
    }

    isOpen = () => {
        return true
    }

    open = () => {

    }

    close = () => {

    }

    read = (len: number) => {
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

    readAll = () => {
        return this.recv_buf
    }

    write = (buf: string) => {
        this.send_buf = buf
    }

    getSendBuffer = () => {
        return this.send_buf
    }

    commitPosition = () => {}

    rollbackPosition = () => {}
}