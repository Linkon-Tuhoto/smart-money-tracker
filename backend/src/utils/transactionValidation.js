
import mongoose from "mongoose";

const ALLOWED_TYPES = [
  "expense",
  "income",
  "transfer",
  "withdrawal",
  "tithe",
];

const ALLOWED_SOURCES = ["manual", "mpesa"];

const ALLOWED_PAYMENT_METHODS = [
  "cash",
  "mpesa",
  "bank",
  "card",
  "other",
];

export function validateTransaction(input, { partial = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "A valid transaction object is required." };
  }

  const allowedFields = new Set([
    "amount",
    "type",
    "category",
    "categoryId",
    "description",
    "transactionDate",
    "source",
    "paymentMethod",
    "originalMessage",
    "currency",
    "accountId",
  ]);

  if (Object.keys(input).some((key) => !allowedFields.has(key))) {
    return { error: "The request contains unsupported fields." };
  }

  if (!partial) {
    const requiredFields = [
      "amount",
      "type",
      "description",
      "transactionDate",
    ];

    if (
      requiredFields.some(
        (field) =>
          input[field] === undefined ||
          input[field] === null ||
          input[field] === ""
      )
    ) {
      return {
        error: "Please provide all required transaction fields.",
      };
    }
  }

  const cleaned = {};

  if (input.amount !== undefined) {
    if (
      typeof input.amount !== "number" ||
      !Number.isFinite(input.amount) ||
      input.amount <= 0 ||
      input.amount > 1_000_000_000
    ) {
      return { error: "Amount must be a positive valid number." };
    }

    const amountMinor = Math.round(input.amount * 100);

    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      return { error: "Amount is invalid." };
    }

    cleaned.amountMinor = amountMinor;
  }

  if (input.type !== undefined) {
    if (!ALLOWED_TYPES.includes(input.type)) {
      return { error: "Unsupported transaction type." };
    }

    cleaned.type = input.type;
  }

  if (input.categoryId !== undefined) {
    if (
      typeof input.categoryId !== "string" ||
      !mongoose.isValidObjectId(input.categoryId)
    ) {
      return { error: "A valid category ID is required." };
    }

    cleaned.categoryId = input.categoryId;
  }

  // Retained for legacy transactions and uncategorized M-Pesa imports.
  if (input.category !== undefined) {
    if (
      typeof input.category !== "string" ||
      !input.category.trim() ||
      input.category.trim().length > 80
    ) {
      return {
        error: "Category must contain 1 to 80 characters.",
      };
    }

    cleaned.category = input.category.trim();
  }

  if (input.description !== undefined) {
    if (
      typeof input.description !== "string" ||
      !input.description.trim() ||
      input.description.trim().length > 500
    ) {
      return {
        error: "Description must contain 1 to 500 characters.",
      };
    }

    cleaned.description = input.description.trim();
  }

  if (input.transactionDate !== undefined) {
    if (
      typeof input.transactionDate !== "string" &&
      typeof input.transactionDate !== "number" &&
      !(input.transactionDate instanceof Date)
    ) {
      return { error: "Please provide a valid transaction date." };
    }

    const date = new Date(input.transactionDate);

    if (!Number.isFinite(date.getTime())) {
      return { error: "Please provide a valid transaction date." };
    }

    cleaned.transactionDate = date.toISOString();
  }

  if (input.source !== undefined) {
    if (!ALLOWED_SOURCES.includes(input.source)) {
      return { error: "Source must be manual or mpesa." };
    }

    cleaned.source = input.source;
  }

  if (input.paymentMethod !== undefined) {
    if (!ALLOWED_PAYMENT_METHODS.includes(input.paymentMethod)) {
      return { error: "Unsupported payment method." };
    }

    cleaned.paymentMethod = input.paymentMethod;
  }

  if (input.accountId !== undefined) {
    if (
      typeof input.accountId !== "string" ||
      !mongoose.isValidObjectId(input.accountId)
    ) {
      return { error: "A valid account ID is required." };
    }

    cleaned.accountId = input.accountId;
  }

  if (input.originalMessage !== undefined) {
    if (
      typeof input.originalMessage !== "string" ||
      input.originalMessage.length > 5000
    ) {
      return {
        error: "The original message must be 5000 characters or fewer.",
      };
    }

    cleaned.originalMessage = input.originalMessage;
  }

  if (input.currency !== undefined) {
    if (input.currency !== "KES") {
      return { error: "Only KES is currently supported." };
    }

    cleaned.currency = "KES";
  }

  if (!partial) {
    cleaned.currency = cleaned.currency || "KES";
    cleaned.source = cleaned.source || "manual";

    cleaned.paymentMethod =
      cleaned.paymentMethod ||
      (cleaned.source === "mpesa" ? "mpesa" : "cash");
  }

  return { value: cleaned };
}
