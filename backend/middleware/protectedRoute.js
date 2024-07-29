import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import generateToken, { setTokenCookie } from "../utils/generateToken.js";

const protectRoute = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken;
    if (accessToken == undefined) {
      const header = req.headers["authorization"];
      accessToken = header && header.split(" ")[1];
    } else {
      accessToken = req.cookies.accessToken;
    }
    if (!accessToken) {
      const tokenRenewed = await renewToken(req, res);
      if (tokenRenewed) {
        return next();
      } else {
        return res
          .status(401)
          .json({ message: "No valid Refresh tokens found" });
      }
    }
    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.userId = decoded.userId;

      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { id: true, name: true, email: true, avatar: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const renewToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return false;
  }

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!storedToken || new Date() > storedToken.expiresAt) {
      return false;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const newAccessToken = generateToken(decoded.userId, "15d");
    setTokenCookie(
      res,
      newAccessToken,
      "accessToken",
      15 * 24 * 60 * 60 * 1000
    );

    return true;
  } catch (err) {
    return false;
  }
};

export default protectRoute;
