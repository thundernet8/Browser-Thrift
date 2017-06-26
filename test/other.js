var EventEmitter = require('events')

class MyEmitter extends EventEmitter {

}

var myEmitter = new MyEmitter()
myEmitter.on('event', (e) => {
    console.log('an event occurred!', e)
})

window.myEmitter = myEmitter