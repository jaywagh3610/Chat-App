const mongoose = require("mongoose");
const { Schema } = mongoose;

const registerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
});
const RegisterModel = mongoose.model("accounts", registerSchema);

module.exports = RegisterModel;
