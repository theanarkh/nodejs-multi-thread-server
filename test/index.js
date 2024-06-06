const path = require('path');
const http = require('http')

const { createServer } = require('../lib/primary');
createServer({
    file: path.resolve(__dirname, 'handler.js')
})
.listen({
    port: 9999,
})
.on('listening', () => {
    for (let i = 0; i < 10; i++) {
        http.get("http://127.0.0.1:9999", {agent: false}, res => {
            let chunk
            res.on('data', (data) => {
                chunk = chunk ? Buffer.concat([chunk, data]) : data;
            });
            res.on('end', () => {
                console.log(chunk.toString())
            })
        })
    }
})
.on('error', console.error)