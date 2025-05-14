import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Token missing." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId).select(
      "isAdmin isSuperAdmin email tenantId"
    );

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. User not found." });
    }

    req.user = {
      userId: decodedToken.userId,
      email: user.email,
      isAdmin: user.isAdmin,
      isSuperAdmin: user.isSuperAdmin,
      tenantId: user.tenantId,
    };

    next();
    console.log("Headers:", req.headers);
console.log("Cookies:", req.cookies);
console.log("Token:", req.cookies?.token || req.headers.authorization?.split(" ")[1]);

  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ status: false, message: "Token invalid or expired." });
  }
};


const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { protectRoute, isAdminRoute };