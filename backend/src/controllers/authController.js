
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { logger } from "../config/logger.js";

const COOKIE_NAME = "accessToken";
const TOKEN_LIFETIME = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

function generateToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: userId.toString(),
      issuer: "smart-money-tracker",
      audience: "smart-money-tracker-users",
      expiresIn: TOKEN_LIFETIME,
    }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register
export async function register(req, res) {
  try {
    const { fullName, email, phone, password } = req.body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Full name must not exceed 100 characters.",
      });
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
    }

    if (
      phone !== undefined &&
      phone !== null &&
      (typeof phone !== "string" || phone.trim().length > 20)
    ) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be text of no more than 20 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password using our existing Argon2id utility.
    const passwordHash = await hashPassword(password);

    const userData = {
      fullName: normalizedName,
      email: normalizedEmail,
      passwordHash,
    };

    if (typeof phone === "string" && phone.trim()) {
      userData.phone = phone.trim();
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    // The JWT is placed in an HTTP-only cookie, not JSON.
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    logger.error(
      { errorName: error.name, errorCode: error.code },
      "Registration failed"
    );

    return res.status(500).json({
      success: false,
      message: "Could not register your account.",
    });
  }
}

// POST /api/auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // passwordHash is excluded by default in the User model,
    // so explicitly include it for password verification.
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is suspended.",
      });
    }

    const passwordMatches = await verifyPassword(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    logger.error(
      { errorName: error.name, errorCode: error.code },
      "Login failed"
    );

    return res.status(500).json({
      success: false,
      message: "Could not log in.",
    });
  }
}

// GET /api/auth/me
export async function getMe(req, res) {
  try {
    // requireAuth has already verified the cookie and loaded the user.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(req.user),
    });
  } catch (error) {
    logger.error(
      { errorName: error.name, errorCode: error.code },
      "Failed to retrieve current user"
    );

    return res.status(500).json({
      success: false,
      message: "Could not retrieve your account.",
    });
  }
}

// POST /api/auth/logout
export async function logout(req, res) {
  const { maxAge, ...clearOptions } = cookieOptions();

  res.clearCookie(COOKIE_NAME, clearOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}