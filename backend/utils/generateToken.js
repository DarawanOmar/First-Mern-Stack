import jwt from "jsonwebtoken";

const generateToken = (userId, expireDate) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expireDate,
  });
};

export const setTokenCookie = (res, token, name, timeCookie) => {
  res.cookie(name, token, {
    maxAge: timeCookie,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

export default generateToken;
