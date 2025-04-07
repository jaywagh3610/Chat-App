const express = require("express");
const runWorker = require("../middleware/main");

const router = express.Router();

router.get("/heavy", runWorker);

module.exports = router;
