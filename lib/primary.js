const { Worker } = require('worker_threads');
const os = require('os');
const fs = require('fs');
const net = require('net');
const dns = require('dns');
const { EventEmitter } = require('events');
const path = require('path');

class Server extends EventEmitter {
    options
    constructor(options) {
        super();
        this.options = { ...options };
    }
    workers = [];
    listen({
        host,
        port,
    }) {
        const { file } = this.options
        if (typeof net._createServerHandle !== "function") {
            process.nextTick(() => {
                this.emit("error", new Error("unsupported"))
            });
            return;
        }
        
        dns.lookup(host || '127.0.0.1', (err, ip) => {
            if (err) {
                this.emit("error", err)
                return;
            }
            const handle = net._createServerHandle(ip, port)
            if (typeof handle === 'number') {
                let error;
                try {
                    const uv = process.binding('uv')
                    error =  new Error("failed to create server: " + uv.getErrorMap().get(handle));
                } catch(e) {
                    error=  new Error("failed to create server");
                } finally {
                    this.emit("error", error)
                }
            }
            for (let i = 0; i < os.cpus().length; i++) {
                // TODO: create new worker when it crashes
                const worker = new Worker(path.resolve(__dirname, "worker.js"), { workerData: { file } });
                worker.postMessage({ action: 'init', fd: handle.fd })
                this.workers.push(worker)
            }
            this.emit("listening")
        })
        return this;
    }
    close() {
        this.workers.forEach(worker => {
            worker.postMessage({action: 'exit'})
        })
    }
}

function createServer(options) {
    if (!fs.existsSync(options.file)) {
        throw new Error("invalid file")
    }
    return new Server(options)
}

module.exports.createServer = createServer;
