import helpers from './helpers'

import ThriftBrowser from 'thrift-browser'
const { TJSONProtocol,
    TBufferedTransport,
    createWSConnection,
    createXHRConnection,
    createClient
} = ThriftBrowser

let conn = createWSConnection("localhost", 9090, {
    path: "/thrift/rpc"
})
conn.open()

// let conn = createXHRConnection("localhost", 9090, {
//     path: "/thrift/rpc"
// })

conn.on("open", err => {
    console.log("WebSockert connected to: ", conn.uri())
})
conn.on("error", function(err){console.dir(err)})

export default function thriftRPC<T>(method, params): Promise<T> {
	let service = method.split('.')[0];
    let func = method.split('.')[1];

    let client = createClient(helpers[service], conn)
    return new Promise((resolve, reject) => {
        try {
            client[func](...Object.keys(params).map(key => params[key]), (err, result) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            });
        } catch (e) {
            reject(e)
        }
    })
}