[English Intro](./README.md)

## Browser-Thrift

Thrift RPC data transport protocol re-implementation in TypeScript for browser side RPC client.
Thrift RPC数据传输协议TypeScript版重实现，用于浏览器端RPC客户端。

并且带来了一些改进以解决官方Thrift 生成的适用于浏览器端代码上的问题：

* 官方生成的JS文件，适用于浏览器端的使用了大量全局变量，没有模块导出，并不适合我们常规模块化开发时引入

* 官方生成的Node JS，适用于Node客户端，由于大量使用了浏览器端不支持的net/http/Buffer模块，无法直接在浏览器端使用

* 官方生成的JS文件，没有Call sequence支持，如果服务端响应时间不一，可能造成回调顺序错误，一个解决办法就是每次的RPC调用都重生成Service Client和Connection实例，但是我更希望特别是WebSocket的connection实例能够重用，即在一个WebSocket连接上发送多个RPC调用，避免频繁的TCP连接打开和关闭

* 官方生成的JS文件，因为没有类型支持，对开发时静态检查和提示不便，因此本包代码全部用TypeScript编写

另外对于RPC服务端，本代码完全兼容，因此仍然可以使用Thrift官方工具生成各种语言的服务端代码以实现RPC通信。

## 如何使用

我们推荐你通过 [thrift2ts](https://www.npmjs.com/package/thrift2ts) CLI工具搭配使用本包。 thrift2ts将帮助从原有的thrift文件生成改良的RPC客户端代码，TypeScript格式。

访问 [Thrift2TS-Flow-Demo](https://github.com/thundernet8/Thrift2TS-Flow-Demo) 获取一份完整的演示。
