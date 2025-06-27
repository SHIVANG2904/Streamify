const Usermodel = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports.signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existUser = await Usermodel.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${idx}`;

    const newUser = await Usermodel.create({
      fullname,
      email,
      password,
      profilePic: randomAvatar,
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in user", error: error.message });
  }
};

module.exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully" });
};

module.exports.onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, bio, nativelanguage, learninglanguage, location } =
      req.body;

    if (
      !fullname ||
      !bio ||
      !nativelanguage ||
      !learninglanguage ||
      !location
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const updatedUser = await Usermodel.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User onboarded successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};
