const { parentPort, workerData } = require("worker_threads");

const calculateSum = (n) => {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }

  return sum;
};

const result = calculateSum(workerData);
parentPort.postMessage(`sum of ${workerData}:${result}`);
