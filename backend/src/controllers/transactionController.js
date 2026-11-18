
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { encryptData, decryptData } from "../utils/encryption.js";
import { validateTransaction } from "../utils/transactionValidation.js";
import { logger } from "../config/logger.js";
import { parseMpesaMessage } from "../utils/mpesaParser.js";
import { createMessageFingerprint } from "../utils/messageFingerprint.js";

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function toPublicData(data) {
  const { amountMinor, ...rest } = data;

  return {
    ...rest,
    amount:
      Number.isSafeInteger(amountMinor) && amountMinor >= 0
        ? amountMinor / 100
        : undefined,
  };
}

function publicTransaction(document, data) {
  return {
    id: document._id,
    ...toPublicData(data),
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function logFailure(event, error, message) {
  logger.error(
    {
      event,
      errorName: error?.name || "Error",
      errorCode: error?.code || "UNKNOWN",
    },
    message
  );
}

// Confirm the account belongs to this user and matches the payment method.
async function verifyAccount(userId, accountId, paymentMethod) {
  if (!accountId || !isValidId(accountId)) {
    return { error: "Select a valid account for this transaction." };
  }

  const account = await Account.findOne({
    _id: accountId,
    userId,
  }).select("_id type");

  if (!account) {
    return { error: "The selected account was not found." };
  }

  if (
    paymentMethod !== account.type ||
    !["cash", "mpesa"].includes(paymentMethod)
  ) {
    return {
      error:
        "The selected account does not match the transaction payment method.",
    };
  }

  return { account };
}

// Confirm the category belongs to this user and matches the transaction type.
// The category name is decrypted from the database; it is never trusted from
// the request body.
async function resolveCategory(userId, categoryId, transactionType) {
  if (!["expense", "income"].includes(transactionType)) {
    return { category: null };
  }

  if (!categoryId || !isValidId(categoryId)) {
    return {
      error: `Select a valid ${transactionType} category.`,
    };
  }

  const categoryDocument = await Category.findOne({
    _id: categoryId,
    userId,
    type: transactionType,
  });

  if (!categoryDocument) {
    return {
      error: `The selected category was not found among your ${transactionType} categories.`,
    };
  }

  const categoryData = decryptData(categoryDocument.encryptedData);

  if (
    typeof categoryData.name !== "string" ||
    !categoryData.name.trim()
  ) {
    throw new Error("The selected category has invalid stored data.");
  }

  return {
    category: {
      categoryId: categoryDocument._id.toString(),
      category: categoryData.name,
    },
  };
}

// CREATE TRANSACTION
// POST /api/transactions
export async function createTransaction(req, res) {
  try {
    const validation = validateTransaction(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const data = validation.value;

    if (["transfer", "withdrawal"].includes(data.type)) {
      return res.status(400).json({
        success: false,
        message:
          "Transfers and cash withdrawals must use the account transfer endpoint. That endpoint will be added next.",
      });
    }

    const accountResult = await verifyAccount(
      req.user._id,
      data.accountId,
      data.paymentMethod
    );

    if (accountResult.error) {
      return res.status(400).json({
        success: false,
        message: accountResult.error,
      });
    }

    // Income and expense transactions must use a saved category.
    if (["expense", "income"].includes(data.type)) {
      const categoryResult = await resolveCategory(
        req.user._id,
        data.categoryId,
        data.type
      );

      if (categoryResult.error) {
        return res.status(400).json({
          success: false,
          message: categoryResult.error,
        });
      }

      Object.assign(data, categoryResult.category);
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      encryptedData: encryptData(data),
    });

    logger.info(
      { event: "transaction_created" },
      "Transaction created"
    );

    return res.status(201).json({
      success: true,
      message: "Transaction saved successfully.",
      transaction: publicTransaction(transaction, data),
    });
  } catch (error) {
    logFailure(
      "transaction_create_failed",
      error,
      "Unable to create transaction"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save this transaction right now.",
    });
  }
}

// LIST TRANSACTIONS
// GET /api/transactions
export async function listTransactions(req, res) {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be positive and limit must be between 1 and 100.",
      });
    }

    const filter = { userId: req.user._id };

    const [documents, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    const transactions = documents.map((document) => {
      const data = decryptData(document.encryptedData);
      return publicTransaction(document, data);
    });

    return res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logFailure(
      "transaction_list_failed",
      error,
      "Unable to retrieve transactions"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve transactions right now.",
    });
  }
}

// GET ONE TRANSACTION
// GET /api/transactions/:id
export async function getTransaction(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const document = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    const data = decryptData(document.encryptedData);

    return res.status(200).json({
      success: true,
      transaction: publicTransaction(document, data),
    });
  } catch (error) {
    logFailure(
      "transaction_get_failed",
      error,
      "Unable to retrieve transaction"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve this transaction right now.",
    });
  }
}

// UPDATE TRANSACTION
// PATCH /api/transactions/:id
export async function updateTransaction(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const validation = validateTransaction(req.body, { partial: true });

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    if (Object.keys(validation.value).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update.",
      });
    }

    const document = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    const existingData = decryptData(document.encryptedData);
    const changes = validation.value;

    const updatedData = {
      ...existingData,
      ...changes,
    };

    if (["transfer", "withdrawal"].includes(updatedData.type)) {
      return res.status(400).json({
        success: false,
        message:
          "Transfers and withdrawals cannot be edited through this endpoint.",
      });
    }

    // Verify the final account and payment method.
    const accountResult = await verifyAccount(
      req.user._id,
      updatedData.accountId,
      updatedData.paymentMethod
    );

    if (accountResult.error) {
      return res.status(400).json({
        success: false,
        message: accountResult.error,
      });
    }

    // Resolve a category when:
    // 1. The user supplies a new categoryId, or
    // 2. The transaction changes between income and expense.
    const categoryNeedsResolution =
      ["expense", "income"].includes(updatedData.type) &&
      (
        Object.prototype.hasOwnProperty.call(changes, "categoryId") ||
        updatedData.type !== existingData.type
      );

    if (categoryNeedsResolution) {
      const categoryResult = await resolveCategory(
        req.user._id,
        updatedData.categoryId,
        updatedData.type
      );

      if (categoryResult.error) {
        return res.status(400).json({
          success: false,
          message: categoryResult.error,
        });
      }

      Object.assign(updatedData, categoryResult.category);
    }

    // Do not keep an income/expense category attached to a different type.
    if (!["expense", "income"].includes(updatedData.type)) {
      delete updatedData.categoryId;
    }

    document.encryptedData = encryptData(updatedData);
    await document.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      transaction: publicTransaction(document, updatedData),
    });
  } catch (error) {
    logFailure(
      "transaction_update_failed",
      error,
      "Unable to update transaction"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update this transaction right now.",
    });
  }
}

// DELETE TRANSACTION
// DELETE /api/transactions/:id
export async function deleteTransaction(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    logger.info(
      { event: "transaction_deleted" },
      "Transaction deleted"
    );

    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (error) {
    logFailure(
      "transaction_delete_failed",
      error,
      "Unable to delete transaction"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete this transaction right now.",
    });
  }
}

// IMPORT M-PESA MESSAGE
// POST /api/transactions/import-mpesa
export async function importMpesaMessage(req, res) {
  try {
    const { message } = req.body || {};
    const parsed = parseMpesaMessage(message);

    if (parsed.error) {
      return res.status(400).json({
        success: false,
        message: parsed.error,
      });
    }

    const data = parsed.value;

    // An M-Pesa transaction must belong to the user's M-Pesa account.
    const account = await Account.findOne({
      userId: req.user._id,
      type: "mpesa",
    }).select("_id");

    if (!account) {
      return res.status(400).json({
        success: false,
        message:
          "Create your M-Pesa account before importing M-Pesa messages.",
      });
    }

    data.accountId = account._id.toString();

    // Do not assign a category automatically. The user can assign one later.
    delete data.categoryId;
    data.category = data.category || "Uncategorized";

    const fingerprint = createMessageFingerprint(message);

    const duplicate = await Transaction.findOne({
      userId: req.user._id,
      messageFingerprint: fingerprint,
    }).select("+messageFingerprint");

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This M-Pesa message has already been imported.",
      });
    }

    // The original SMS and transaction code remain encrypted.
    const dataToEncrypt = { ...data };

    const transaction = await Transaction.create({
      userId: req.user._id,
      encryptedData: encryptData(dataToEncrypt),
      messageFingerprint: fingerprint,
    });

    return res.status(201).json({
      success: true,
      message: "M-Pesa message imported successfully.",
      transaction: publicTransaction(transaction, dataToEncrypt),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This M-Pesa message has already been imported.",
      });
    }

    logFailure(
      "mpesa_import_failed",
      error,
      "M-Pesa import failed"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to import this message right now.",
    });
  }
}

// MONTHLY SPENDING SUMMARY
// GET /api/transactions/summary?period=YYYY-MM
export async function getSpendingSummary(req, res) {
  try {
    const period =
      typeof req.query.period === "string" ? req.query.period : "";

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      return res.status(400).json({
        success: false,
        message: "Period is required in YYYY-MM format.",
      });
    }

    const [year, month] = period.split("-").map(Number);

    // Kenya time is UTC+3.
    const start =
      Date.UTC(year, month - 1, 1) - 3 * 60 * 60 * 1000;
    const end =
      Date.UTC(year, month, 1) - 3 * 60 * 60 * 1000;

    const documents = await Transaction.find({
      userId: req.user._id,
    }).lean();

    let income = 0;
    let expenses = 0;
    let tithes = 0;
    let transfers = 0;
    let withdrawals = 0;

    const paymentBreakdown = {
      cash: { income: 0, expenses: 0 },
      mpesa: { income: 0, expenses: 0 },
      other: { income: 0, expenses: 0 },
    };

    const categoryTotals = {};

    for (const document of documents) {
      const data = decryptData(document.encryptedData);

      if (
        !data.transactionDate ||
        !Number.isSafeInteger(data.amountMinor) ||
        data.amountMinor <= 0
      ) {
        continue;
      }

      const timestamp = new Date(data.transactionDate).getTime();

      if (
        !Number.isFinite(timestamp) ||
        timestamp < start ||
        timestamp >= end
      ) {
        continue;
      }

      if (data.type === "income") {
        income += data.amountMinor;
      } else if (data.type === "expense") {
        expenses += data.amountMinor;

        const category = data.category || "Uncategorized";

        categoryTotals[category] =
          (categoryTotals[category] || 0) + data.amountMinor;
      } else if (data.type === "tithe") {
        tithes += data.amountMinor;
      } else if (data.type === "transfer") {
        transfers += data.amountMinor;
      } else if (data.type === "withdrawal") {
        withdrawals += data.amountMinor;
      }

      const method =
        data.paymentMethod ||
        (data.source === "mpesa" ? "mpesa" : "cash");

      const bucket = ["cash", "mpesa"].includes(method)
        ? method
        : "other";

      if (data.type === "income") {
        paymentBreakdown[bucket].income += data.amountMinor;
      } else if (data.type === "expense") {
        paymentBreakdown[bucket].expenses += data.amountMinor;
      }
    }

    const spendingByCategory = Object.entries(categoryTotals)
      .map(([category, amountMinor]) => ({
        category,
        amount: amountMinor / 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    const money = (minor) => minor / 100;

    return res.status(200).json({
      success: true,
      period,
      currency: "KES",
      totals: {
        income: money(income),
        expenses: money(expenses),
        tithes: money(tithes),
        transfers: money(transfers),
        withdrawals: money(withdrawals),
        remaining: money(income - expenses - tithes),
      },
      paymentBreakdown: {
        cash: {
          income: money(paymentBreakdown.cash.income),
          expenses: money(paymentBreakdown.cash.expenses),
          net: money(
            paymentBreakdown.cash.income -
              paymentBreakdown.cash.expenses
          ),
        },
        mpesa: {
          income: money(paymentBreakdown.mpesa.income),
          expenses: money(paymentBreakdown.mpesa.expenses),
          net: money(
            paymentBreakdown.mpesa.income -
              paymentBreakdown.mpesa.expenses
          ),
        },
        other: {
          income: money(paymentBreakdown.other.income),
          expenses: money(paymentBreakdown.other.expenses),
          net: money(
            paymentBreakdown.other.income -
              paymentBreakdown.other.expenses
          ),
        },
      },
      spendingByCategory,
    });
  } catch (error) {
    logFailure(
      "spending_summary_failed",
      error,
      "Unable to calculate spending summary"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to calculate the spending summary right now.",
    });
  }
}
