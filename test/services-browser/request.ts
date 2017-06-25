import helpers from './helpers'

import ThriftBrowser from '../../src/thrift'
const transport = new ThriftBrowser.TWebSocketTransport('ws://localhost:9090/thrift/rpc')
// const transport = new ThriftBrowser.TXHRTransport('http://localhost:9090/thrift/rpc')
transport.open()
// const protocol = new Thrift.TJSONProtocol(transport)
const protocol = new ThriftBrowser.TJSONProtocol(transport)

export default function thriftRPC<T>(method, params): Promise<T> {
	let service = method.split('.')[0];
    let func = method.split('.')[1];

    let client = new helpers[service](protocol);
    return new Promise((resolve, reject) => {
        try {
            client[func](...Object.keys(params).map(key => params[key]), (result) => {
                if (result instanceof Error) {
                    reject(result)
                } else {
                    resolve(result)
                }
            });
        } catch (err) {
            reject(err)
        }
    })
}