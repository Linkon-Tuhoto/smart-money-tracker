
import mongoose from "mongoose";

export function validateBudget(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "A valid budget object is required." };
  }

  const allowedFields = new Set([
    "period",
    "categoryId",
    "limit",
  ]);

  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return {
      error: "The request contains unsupported fields.",
    };
  }

  if (
    typeof input.period !== "string" ||
    !/^\d{4}-(0[1-9]|1[0-2])$/.test(input.period)
  ) {
    return {
      error: "Period must use YYYY-MM format.",
    };
  }

  if (
    typeof input.categoryId !== "string" ||
    !mongoose.isValidObjectId(input.categoryId)
  ) {
    return {
      error: "Select a valid expense category.",
    };
  }

  if (
    typeof input.limit !== "number" ||
    !Number.isFinite(input.limit) ||
    input.limit <= 0 ||
    input.limit > 1_000_000_000
  ) {
    return {
      error: "Budget limit must be a positive valid number.",
    };
  }

  const limitMinor = Math.round(input.limit * 100);

  if (!Number.isSafeInteger(limitMinor) || limitMinor <= 0) {
    return {
      error: "Budget limit is too large or invalid.",
    };
  }

  return {
    value: {
      period: input.period,
      categoryId: input.categoryId,
      limitMinor,
      currency: "KES",
    },
  };
}
