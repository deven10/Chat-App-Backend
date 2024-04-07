const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields!");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });

  if (user) {
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        picture: user.picture,
        token: generateToken(user._id),
      },
      message: "User created successfully!",
    });
  } else {
    res.status(400);
    throw new Error("Failed to create new User!");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please Enter Email & Password!");
  }

  const user = await User.findOne({ email });
  if (user && user.matchPassword(password)) {
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        picture: user.picture,
        token: generateToken(user._id),
      },
      message: "Logged in Successfully!",
    });
  } else {
    res.status(400);
    throw new Error("Invalid Email or Password!");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.send(users);
});

module.exports = { registerUser, loginUser, allUsers, getAllUsers };
