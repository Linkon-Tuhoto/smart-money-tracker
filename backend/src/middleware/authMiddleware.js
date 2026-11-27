import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logger } from "../config/logger.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    // No login cookie means the request is unauthenticated.
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    // Verify the token's signature, issuer, audience and expiry.
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "smart-money-tracker",
      audience: "smart-money-tracker-users",
    });

    // Our login controller stores the user's database ID in "sub".
    if (!payload.sub) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // Load the user without requesting their password hash.
    const user = await User.findById(payload.sub);

    if (!user || user.accountStatus !== "active") {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer valid.",
      });
    }

    // Make the authenticated user available to later middleware/controllers.
    req.user = user;

    // Continue to the next handler.
    return next();
  } catch (error) {
    // Expired, invalid or otherwise unverifiable tokens are rejected.
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Your session is invalid or has expired. Please log in again.",
      });
    }

    logger.error(
      {
        event: "authentication_check_failed",
        errorName: error.name || "Error",
        errorCode: error.code || "UNKNOWN",
      },
      "Authentication middleware failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify your session right now.",
    });
  }
}
