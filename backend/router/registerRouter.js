const express = require("express");
const {
  register,
  getUser,
  selectUser,
} = require("../controller/registrationController");
const router = express.Router();

router.post("/registerUser", register);
router.get("/getUser", getUser);
router.get("/selectUser", selectUser);
module.exports = router;
