const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE;

const connnectDB = async () => {
  try {
    const con = await mongoose.connect(DB);
    // DB.accounts.deleteMany({ number: null });

    console.log("MongoDB is connnected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connnectDB;
