
import mongoose from "mongoose";

import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

import {
  encryptData,
  decryptData,
} from "../utils/encryption.js";

import { validateAccount } from "../utils/accountValidation.js";

import {logger }from "../config/logger.js";

// All money is stored internally in minor units.
// For KES, 1 KES = 100 minor units (cents).
const MAX_AMOUNT_MINOR = 100_000_000_000;

// Convert minor units to a KES amount for API responses.
function toMoney(amountMinor) {
  return Number((amountMinor / 100).toFixed(2));
}

// Check whether a string is a valid MongoDB ObjectId.
function isValidId(id) {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id.toLowerCase()
  );
}

// Return a consistent error response.
function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

// Find an account that belongs to the authenticated user.
async function findOwnedAccount(userId, accountId) {
  if (!isValidId(String(accountId))) {
    return null;
  }

  return Account.findOne({
    _id: accountId,
    userId,
  });
}

// Calculate balances from opening balances and transactions.
//
// Future-dated transactions are excluded so they do not affect
// the balance available today.
async function calculateBalances(userId) {
  const accounts = await Account.find({ userId });

  const balances = new Map();

  // Start with each account's encrypted opening balance.
  for (const account of accounts) {
    const data = await decryptData(account.encryptedData);

    const openingBalanceMinor = Number(data.openingBalanceMinor);

    if (
      !Number.isSafeInteger(openingBalanceMinor) ||
      openingBalanceMinor < 0
    ) {
      throw new Error("INVALID_ACCOUNT_BALANCE_DATA");
    }

    balances.set(account._id.toString(), openingBalanceMinor);
  }

  // Only retrieve this user's transactions.
  const transactions = await Transaction.find({ userId });

  const now = Date.now();

  for (const transaction of transactions) {
    let data;

    try {
      data = await decryptData(transaction.encryptedData);
    } catch (error) {
      logger.error(
        {
          event: "account_balance_transaction_decryption_failed",
          transactionId: transaction._id.toString(),
        },
        "Could not decrypt a transaction while calculating balances"
      );

      // Do not return a potentially incorrect financial balance.
      throw new Error("TRANSACTION_DECRYPTION_FAILED");
    }

    const transactionTime = new Date(data.transactionDate).getTime();

    // Ignore future transactions.
    if (
      !Number.isFinite(transactionTime) ||
      transactionTime > now
    ) {
      continue;
    }

    const amountMinor = Number(data.amountMinor);

    if (
      !Number.isSafeInteger(amountMinor) ||
      amountMinor <= 0
    ) {
      throw new Error("INVALID_TRANSACTION_AMOUNT");
    }

    if (data.type === "income") {
      const accountId = data.accountId?.toString();

      if (balances.has(accountId)) {
        balances.set(
          accountId,
          balances.get(accountId) + amountMinor
        );
      }
    } else if (
      data.type === "expense" ||
      data.type === "tithe" ||
      data.type === "withdrawal"
    ) {
      const accountId = data.accountId?.toString();

      if (balances.has(accountId)) {
        balances.set(
          accountId,
          balances.get(accountId) - amountMinor
        );
      }
    } else if (data.type === "transfer") {
      const fromAccountId = data.fromAccountId?.toString();
      const toAccountId = data.toAccountId?.toString();

      if (balances.has(fromAccountId)) {
        balances.set(
          fromAccountId,
          balances.get(fromAccountId) - amountMinor
        );
      }

      if (balances.has(toAccountId)) {
        balances.set(
          toAccountId,
          balances.get(toAccountId) + amountMinor
        );
      }
    }
  }

  return { accounts, balances };
}

// CREATE ACCOUNT
// POST /api/accounts
export async function createAccount(req, res) {
  try {
    const validation = validateAccount(req.body);

    if (validation.errors?.length) {
      return res.status(400).json({
        success: false,
        message: "Please correct the account details.",
        errors: validation.errors,
      });
    }

    if (!validation.value) {
      return sendError(
        res,
        400,
        "Invalid account details."
      );
    }

    const { type, name, openingBalanceMinor, currency } =
      validation.value;

    // Each user may have one account of each supported type.
    const existingAccount = await Account.findOne({
      userId: req.user.id,
      type,
    });

    if (existingAccount) {
      return sendError(
        res,
        409,
        `You already have a ${type} account.`
      );
    }

    // Sensitive account details are encrypted before storage.
    const encryptedData = await encryptData({
      name,
      openingBalanceMinor,
      currency,
    });

    const account = await Account.create({
      userId: req.user.id,
      type,
      encryptedData,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      account: {
        id: account._id,
        type: account.type,
        name,
        openingBalance: toMoney(openingBalanceMinor),
        currency,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "You already have an account of this type."
      );
    }

    logger.error(
      {
        event: "account_create_failed",
        errorName: error.name,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack,
        mongoCode: error.code,
        validationErrors:
          error.errors
            ? Object.keys(error.errors):
            undefined,
      },
      "Account creation failed"
    );

    return sendError(
      res,
      500,
      "Could not create the account."
    );
  }
}

// LIST ACCOUNTS
// GET /api/accounts
export async function listAccounts(req, res) {
  try {
    const accounts = await Account.find({
      userId: req.user.id,
    }).sort({ createdAt: 1 });

    const result = [];

    for (const account of accounts) {
      const data = await decryptData(account.encryptedData);

      result.push({
        id: account._id,
        type: account.type,
        name: data.name,
        openingBalance: toMoney(
          Number(data.openingBalanceMinor)
        ),
        currency: data.currency || "KES",
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      });
    }

    return res.json({
      success: true,
      count: result.length,
      accounts: result,
    });
  } catch (error) {
    logger.error(
      {
        event: "account_list_failed",
        errorName: error.name,
        errorCode: error.code,
      },
      "Could not list accounts"
    );

    return sendError(
      res,
      500,
      "Could not load your accounts."
    );
  }
}

// GET ONE ACCOUNT
// GET /api/accounts/:id
export async function getAccount(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(
        res,
        400,
        "Invalid account ID."
      );
    }

    const account = await findOwnedAccount(
      req.user.id,
      req.params.id
    );

    if (!account) {
      return sendError(res, 404, "Account not found.");
    }

    const data = await decryptData(account.encryptedData);

    return res.json({
      success: true,
      account: {
        id: account._id,
        type: account.type,
        name: data.name,
        openingBalance: toMoney(
          Number(data.openingBalanceMinor)
        ),
        currency: data.currency || "KES",
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "account_get_failed",
        errorName: error.name,
        errorCode: error.code,
      },
      "Could not retrieve account"
    );

    return sendError(
      res,
      500,
      "Could not load the account."
    );
  }
}

// GET ALL ACCOUNT BALANCES
// GET /api/accounts/balances
export async function getAccountBalances(req, res) {
  try {
    const { accounts, balances } = await calculateBalances(
      req.user.id
    );

    const result = [];
    let totalBalanceMinor = 0;

    for (const account of accounts) {
      const data = await decryptData(account.encryptedData);
      const balanceMinor =
        balances.get(account._id.toString()) ?? 0;

      result.push({
        id: account._id,
        type: account.type,
        name: data.name,
        balance: toMoney(balanceMinor),
        currency: data.currency || "KES",
      });

      totalBalanceMinor += balanceMinor;
    }

    return res.json({
      success: true,
      accounts: result,
      totalBalance: toMoney(totalBalanceMinor),
      currency: "KES",
    });
  } catch (error) {
    logger.error(
      {
        event: "account_balances_failed",
        errorName: error.name,
        errorCode: error.code,
      },
      "Could not calculate account balances"
    );

    return sendError(
      res,
      500,
      "Could not calculate your balances. Please try again."
    );
  }
}

// GET ONE ACCOUNT BALANCE
// GET /api/accounts/:id/balance
export async function getAccountBalance(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return sendError(
        res,
        400,
        "Invalid account ID."
      );
    }

    const account = await findOwnedAccount(
      req.user.id,
      req.params.id
    );

    if (!account) {
      return sendError(res, 404, "Account not found.");
    }

    const { balances } = await calculateBalances(
      req.user.id
    );

    const balanceMinor =
      balances.get(account._id.toString()) ?? 0;

    const data = await decryptData(account.encryptedData);

    return res.json({
      success: true,
      account: {
        id: account._id,
        type: account.type,
        name: data.name,
        balance: toMoney(balanceMinor),
        currency: data.currency || "KES",
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "account_balance_failed",
        errorName: error.name,
        errorCode: error.code,
      },
      "Could not calculate account balance"
    );

    return sendError(
      res,
      500,
      "Could not calculate the account balance."
    );
  }
}

// TRANSFER BETWEEN ACCOUNTS
// POST /api/accounts/transfer
export async function transferBetweenAccounts(req, res) {
  try {
    const {
      fromAccountId,
      toAccountId,
      amount,
      description,
      transactionDate,
    } = req.body;

    // Validate account IDs.
    if (
      !isValidId(fromAccountId) ||
      !isValidId(toAccountId)
    ) {
      return sendError(
        res,
        400,
        "Provide valid source and destination account IDs."
      );
    }

    if (
      fromAccountId.toLowerCase() ===
      toAccountId.toLowerCase()
    ) {
      return sendError(
        res,
        400,
        "Choose two different accounts."
      );
    }

    // Validate the amount in KES before converting to minor units.
    const amountNumber = Number(amount);

    if (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0 ||
      amountNumber > 1_000_000_000
    ) {
      return sendError(
        res,
        400,
        "Transfer amount must be greater than zero and within the allowed limit."
      );
    }

    const amountMinor = Math.round(amountNumber * 100);

    if (
      !Number.isSafeInteger(amountMinor) ||
      amountMinor <= 0 ||
      amountMinor > MAX_AMOUNT_MINOR
    ) {
      return sendError(
        res,
        400,
        "Invalid transfer amount."
      );
    }

    if (
      description !== undefined &&
      (typeof description !== "string" ||
        description.length > 500)
    ) {
      return sendError(
        res,
        400,
        "Description must be text no longer than 500 characters."
      );
    }

    // Prevent unexpected request fields from being silently ignored.
    const allowedFields = new Set([
      "fromAccountId",
      "toAccountId",
      "amount",
      "description",
      "transactionDate",
    ]);

    if (
      Object.keys(req.body).some(
        (field) => !allowedFields.has(field)
      )
    ) {
      return sendError(
        res,
        400,
        "The request contains unsupported fields."
      );
    }

    let date = new Date();

    if (transactionDate !== undefined) {
      date = new Date(transactionDate);

      if (
        typeof transactionDate !== "string" ||
        !Number.isFinite(date.getTime())
      ) {
        return sendError(
          res,
          400,
          "Provide a valid transaction date."
        );
      }

      // Do not allow a future transfer to affect today's balance.
      if (date.getTime() > Date.now()) {
        return sendError(
          res,
          400,
          "Transfer date cannot be in the future."
        );
      }
    }

    const sourceAccount = await findOwnedAccount(
      req.user.id,
      fromAccountId
    );

    const destinationAccount = await findOwnedAccount(
      req.user.id,
      toAccountId
    );

    if (!sourceAccount || !destinationAccount) {
      return sendError(
        res,
        404,
        "Source or destination account was not found."
      );
    }

    // Calculate the source account's available balance.
    const { balances } = await calculateBalances(
      req.user.id
    );

    const sourceBalanceMinor =
      balances.get(sourceAccount._id.toString()) ?? 0;

    if (sourceBalanceMinor < amountMinor) {
      return res.status(400).json({
        success: false,
        message: "Insufficient funds in the source account.",
        availableBalance: toMoney(sourceBalanceMinor),
        requestedAmount: toMoney(amountMinor),
        currency: "KES",
      });
    }

    // Store a transfer as one encrypted transaction.
    // The balance calculator subtracts it from the source
    // and adds it to the destination.
    const encryptedData = await encryptData({
      type: "transfer",
      amountMinor,
      fromAccountId: sourceAccount._id.toString(),
      toAccountId: destinationAccount._id.toString(),
      category: "Transfer",
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : "Transfer between accounts",
      transactionDate: date.toISOString(),
      source: "manual",
      currency: "KES",
    });

    const transaction = await Transaction.create({
      userId: req.user.id,
      encryptedData,
    });

    return res.status(201).json({
      success: true,
      message: "Transfer recorded successfully.",
      transaction: {
        id: transaction._id,
        type: "transfer",
        amount: toMoney(amountMinor),
        currency: "KES",
        transactionDate: date.toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      {
        event: "account_transfer_failed",
        errorName: error.name,
        errorCode: error.code,
      },
      "Account transfer failed"
    );

    return sendError(
      res,
      500,
      "Could not record the transfer. Please try again."
    );
  }
}
