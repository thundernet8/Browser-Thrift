var express = require('express')
var app = express()
var fs = require('fs')

app.get('/', function(req, res) {
    res.header('content-type', 'text/html')
    res.send(fs.readFileSync('dist/index.html').toString())
})

app.use(express.static('dist'))

app.listen(8080, function () {
    console.log('Page served on 8080')
})