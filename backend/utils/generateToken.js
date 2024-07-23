import jwt from "jsonwebtoken";

const generateToken = (userId, res, expireDate, nameCookie, timeCookie) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: expireDate,
  });

  res.cookie(nameCookie, token, {
    maxAge: timeCookie, // in milliseconds
    httpOnly: true, // prevent XSS cross site scripting
    sameSite: "strict", // CSRF attack cross-site request forgery
    secure: process.env.NODE_ENV !== "development", // HTTPS only in production
  });

  return token;
};

export default generateToken;
