import helpers from './helpers'

import ThriftBrowser from '../../src/thrift'
const { TJSONProtocol,
    TXHRTransport,
    TBufferedTransport,
    createWSConnection,
    createClient
} = ThriftBrowser

let conn = createWSConnection("localhost", 9090, {
    path: "/thrift/rpc"
})
conn.open()

export default function thriftRPC<T>(method, params): Promise<T> {
	let service = method.split('.')[0];
    let func = method.split('.')[1];

    let serviceClass = helpers[service]
    let client = createClient(helpers[service], conn)
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