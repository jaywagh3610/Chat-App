const { parentPort } = require("worker_threads");
const Sentiment = require("sentiment");

const sentiment = new Sentiment();

parentPort.on("message", (data) => {
  if (!data || !data.message) {
    parentPort.postMessage({ error }, "no message provided");
    return;
  }
});
