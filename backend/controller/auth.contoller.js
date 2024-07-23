import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const Register = async (req, res) => {
  try {
    const { email, password, name, gender, confirm_password } = req.body;

    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: "Passwords don't match" });
    }

    const user = await prisma.user.findUnique({ where: { name } });

    if (user) {
      return res.status(400).json({ error: "user already exists" });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?name=${name}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?name=${name}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        gender: gender ?? "MALE",
        password: hashedPassword,
        role: "USER",
        name,
        avatar: gender === "male" ? boyProfilePic : girlProfilePic,
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcryptjs.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Access Token (short lifespan)
    const accessToken = generateToken(
      user.id,
      res,
      "5m", // 5 minutes
      "accessToken",
      5 * 60 * 1000 // 5 minutes in milliseconds
    );

    // Refresh Token (long lifespan)
    const refreshToken = generateToken(
      user.id,
      res,
      "15d", // 15 days
      "refreshToken",
      15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
    );

    res.status(200).json({
      message: "Login Success",
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

export const Logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    user: req.user,
    tset: "test",
    message: "User found",
  });
  // try {
  //   const user = await prisma.user.findUnique({ where: { id: req.user.id } });

  //   if (!user) {
  //     return res.status(404).json({ error: "User not found" });
  //   }

  //   res.status(200).json({
  //     id: user.id,
  //     username: user.name,
  //     email: user.email,
  //     role: user.role,
  //     gender: user.gender,
  //     profilePic: user.avatar,
  //   });
  // } catch (error) {
  //   console.log("Error in getMe controller", error.message);
  //   res.status(500).json({ error: "Internal Server Error" });
  // }
};
