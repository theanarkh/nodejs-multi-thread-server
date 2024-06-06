const { threadId } = require('worker_threads');
module.exports = function(_, res) {
    res.end(`hello! i am worker${threadId}!`);
}