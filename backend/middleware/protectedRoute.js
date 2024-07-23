import jwt from "jsonwebtoken";
import prisma from "../db/prisma.js";
import generateToken from "../utils/generateToken.js";

const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      const tokenRenewed = await renewToken(req, res);
      if (tokenRenewed) {
        console.log("Renew Token Success");
        return next();
      } else {
        return; // End the middleware execution if no valid tokens are found
      }
    }

    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ valid: false, message: "Invalid Token" });
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
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const renewToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ valid: false, message: "No Refresh token" });
    return false;
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    generateToken(
      decoded.userId,
      res,
      "5m", // 5 minutes
      "accessToken",
      5 * 60 * 1000 // 5 minutes in milliseconds
    );

    return true;
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid Refresh Token" });
    return false;
  }
};

export default protectRoute;
