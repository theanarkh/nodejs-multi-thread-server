const { parentPort, workerData, threadId } = require('worker_threads');
const { file } = workerData;
const handler = require(file);
const http = require('http');

let server;

parentPort.on('message', (msg) => {
    if (msg.action === 'exit') {
        server && server.close();
        return;
    }
    server = http.createServer(handler).listen({fd: +msg.fd}, () => {
        console.log(`worker ${threadId} listening`)
    });
});