const { Worker } = require("worker_threads");

const runWorker = (num) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./middleware/worker.js", { workerData: num });

    worker.on("message", resolve);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
};
// (async () => {
//   const results = await Promise.all([runWorker(1000000), runWorker(2000000)]);
//   console.log("Results:", results);
// })();

module.exports = runWorker;
