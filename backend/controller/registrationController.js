const RegisterModel = require("../models/registrationModel");
const { message } = require("./messagesController");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookie = require("cookie");
// const redisClient = require("../middleware/redisClient");
const redis = require("ioredis");
dotenv.config({ path: "./config.env" });
const JWT_SECRET = process.env.JWT_SECRET;
// const client = redis.createClient();

const register = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const user = await RegisterModel.findOne({ mobileNumber });
    console.log(name, mobileNumber);
    if (user) {
      return res.status(409).json({
        success: false,
        message: "The user is already registered",
        // data: user,
      });
    }
    const userModel = new RegisterModel({
      name,
      mobileNumber,
    });
    await userModel.save();

    const token = jwt.sign(
      { userId: userModel._id, mobileNumber },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "The user register successfully",
      token,
      data: userModel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went to wrong",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const { mobileNumber } = req.query;
    console.log(req.query);

    const user = await RegisterModel.findOne({ mobileNumber });
    // console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const token = jwt.sign({ userId: user._id, mobileNumber }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      // maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // await client.setex(`user${mobileNumber}`, 3600, json.strinfy(user));
    return res.status(200).json({
      success: true,
      message: "successful",
      token,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went to wrong",
      error: error.message,
    });
  }
};

const selectUser = async (req, res) => {
  try {
    const { _id } = req.query;

    const user = await RegisterModel.findById({ _id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "successful",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went to wrong",
      error: error.message,
    });
  }
};
module.exports = { register, getUser, selectUser };
