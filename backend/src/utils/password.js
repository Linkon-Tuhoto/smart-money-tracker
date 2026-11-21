import argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(password) {
  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 128
  ) {
    throw new Error("A valid password is required");
  }

  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password, passwordHash) {
  if (
    typeof password !== "string" ||
    password.length === 0 ||
    password.length > 128 ||
    typeof passwordHash !== "string" ||
    passwordHash.length === 0
  ) {
    return false;
  }

  return argon2.verify(passwordHash, password);
}