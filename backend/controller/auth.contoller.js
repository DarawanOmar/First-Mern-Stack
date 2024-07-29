import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import generateToken, { setTokenCookie } from "../utils/generateToken.js";
import { LoginValidation } from "../validations/LoginValidation.js";
import { changeToErrorObject } from "../functions/joiError.js";

export const Register = async (req, res) => {
  try {
    const { error, value } = LoginValidation.register(req.body);
    if (error) {
      return res.status(400).json(changeToErrorObject(error));
    }
    if (value.password !== value.confirmPassword) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await prisma.user.findUnique({ where: { name: value.name } });

    if (user) {
      return res.status(400).json({ error: "user already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(value.password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?name=${value.name}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?name=${value.name}`;

    const newUser = await prisma.user.create({
      data: {
        email: value.email,
        gender: "MALE",
        password: hashedPassword,
        role: "USER",
        name: value.name,
        avatar: boyProfilePic,
      },
    });
    if (newUser) {
      res.status(201).json({
        message: "User created successfully",
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          role: newUser.role,
        },
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { error, value } = LoginValidation.login(req.body);
    if (error) {
      return res.status(400).json(changeToErrorObject(error));
    }

    const user = await prisma.user.findUnique({
      where: { email: value.email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcryptjs.compare(value.password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const accessToken = generateToken(user.id, "15d");
    const refreshToken = generateToken(user.id, "15d");

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });

    setTokenCookie(res, accessToken, "accessToken", 15 * 24 * 60 * 60 * 1000);
    setTokenCookie(res, refreshToken, "refreshToken", 15 * 24 * 60 * 60 * 1000);

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const Logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const renewToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!storedToken || new Date() > storedToken.expiresAt) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = generateToken(decoded.userId, "15d");
    setTokenCookie(
      res,
      newAccessToken,
      "accessToken",
      15 * 24 * 60 * 60 * 1000
    );

    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
