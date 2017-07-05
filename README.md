[中文说明](./README-CN.md)

## Browser-Thrift

Thrift RPC data transport protocol re-implementation in TypeScript for browser side RPC client.

Also introduce some improvements.

* add sequence support for RPC client so that it can reuse the Websocket connection without incorrect response callback order

* moduled script file, easy to import and package, rather than many global variables in official generated client for browser

* all generated TypeScript files introduce types support and result in more convenient development of your app

## How

We recommend you to use this package with [thrift2ts](https://www.npmjs.com/package/thrift2ts) cli tool. thrift2ts will help you to generate improved RPC clients code from thrift files.

Visit [Thrift2TS-Flow-Demo](https://github.com/thundernet8/Thrift2TS-Flow-Demo) for a complete demo.