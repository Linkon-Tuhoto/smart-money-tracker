
import mongoose from "mongoose";

import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

import { encryptData, decryptData } from "../utils/encryption.js";
import { logger } from "../config/logger.js";

/*
 * Kenya uses East Africa Time (EAT), which is UTC+3.
 *
 * These helpers convert a YYYY-MM period into UTC dates representing
 * the beginning and end of that month in Kenya.
 */
const KENYA_OFFSET_MINUTES = 180;

function getKenyaMonthRange(period) {
  const [year, month] = period.split("-").map(Number);

  const start = new Date(
    Date.UTC(year, month - 1, 1, 0, 0, 0) -
      KENYA_OFFSET_MINUTES * 60 * 1000
  );

  const end = new Date(
    Date.UTC(year, month, 1, 0, 0, 0) -
      KENYA_OFFSET_MINUTES * 60 * 1000
  );

  return { start, end };
}

/*
 * Returns the current month in Kenya's timezone.
 */
function getCurrentKenyaPeriod() {
  const now = new Date();

  const kenyaTime = new Date(
    now.getTime() + KENYA_OFFSET_MINUTES * 60 * 1000
  );

  const year = kenyaTime.getUTCFullYear();
  const month = String(kenyaTime.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/*
 * Normalizes category names so that small differences in capitalization
 * do not cause spending to be counted under different categories.
 */
function normalizeCategoryName(name) {
  if (typeof name !== "string") return "";

  return name.trim().toLowerCase();
}

/*
 * Safely converts an amount stored in minor units into a normal KSh amount.
 *
 * For example:
 * 150000 minor units = KSh 1,500.
 */
function toMajorUnits(amountMinor) {
  const amount = Number(amountMinor);

  if (!Number.isFinite(amount)) return 0;

  return amount / 100;
}

/*
 * Converts an ID into a comparable string.
 */
function normalizeId(id) {
  if (!id) return "";

  return id.toString();
}

/*
 * Checks whether a transaction belongs to the requested month.
 *
 * transactionDate is encrypted, so we check it after decrypting
 * the transaction.
 */
function isWithinPeriod(transactionDate, start, end) {
  if (!transactionDate) return false;

  const date = new Date(transactionDate);

  if (Number.isNaN(date.getTime())) return false;

  return date >= start && date < end;
}

/*
 * GET /api/budgets/progress?period=2026-10
 *
 * Returns:
 * - Each budget's spending progress.
 * - Remaining amount for each budget.
 * - Budget warning statuses.
 * - Total expenses for the month.
 * - Expenses in categories without budgets.
 */
export const getBudgetProgress = async (req, res) => {
  try {
    const period = req.query.period || getCurrentKenyaPeriod();

    /*
     * Validate the requested month.
     */
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use YYYY-MM format.",
      });
    }

    const userId = req.user.id || req.user._id;

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user session.",
      });
    }

    const { start, end } = getKenyaMonthRange(period);

    const now = new Date();

    // A month is complete only after its end date has passed.
    const monthCompleted = now >= end;

    /*
     * 1. Fetch this user's budgets for the requested month.
     *
     * Budget period is stored outside encryptedData in the current
     * Budget model, so we can filter it directly.
     */
    const budgetDocuments = await Budget.find({
      userId,
      period,
    }).lean();

    /*
     * 2. Fetch this user's transactions.
     *
     * Financial details are encrypted, so we decrypt them before
     * checking their type, category and transaction date.
     */
    const transactionDocuments = await Transaction.find({
      userId,
    }).lean();

    const monthlyExpenses = [];

    for (const document of transactionDocuments) {
      try {
        const transaction = decryptData(document.encryptedData);

        if (!transaction || transaction.type !== "expense") {
          continue;
        }

        if (
          !isWithinPeriod(
            transaction.transactionDate,
            start,
            end
          )
        ) {
          continue;
        }

        monthlyExpenses.push({
          categoryId: normalizeId(transaction.categoryId),
          category: transaction.category || "Uncategorized",
          categoryKey: normalizeCategoryName(transaction.category),
          amountMinor: Number(transaction.amountMinor) || 0,
        });
      } catch (error) {
        /*
         * Do not expose encrypted data or transaction contents in logs.
         * A transaction that cannot be decrypted is skipped.
         */
        logger.error(
          {
            transactionId: document._id?.toString(),
            error: error.message,
          },
          "Could not decrypt transaction while calculating budget progress"
        );
      }
    }

    /*
     * 3. Decrypt the budgets.
     */
    const budgets = [];

    for (const document of budgetDocuments) {
      try {
        const data = decryptData(document.encryptedData);

        if (!data) continue;

        budgets.push({
          id: document._id.toString(),
          period: document.period,
          categoryId: normalizeId(data.categoryId),
          category: data.category || "Unnamed category",
          categoryKey: normalizeCategoryName(data.category),
          limitMinor: Number(data.limitMinor) || 0,
          currency: data.currency || "KES",
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        });
      } catch (error) {
        logger.error(
          {
            budgetId: document._id?.toString(),
            error: error.message,
          },
          "Could not decrypt budget while calculating progress"
        );
      }
    }

    /*
     * 4. Calculate total spending for each category.
     *
     * We use categoryId when available.
     *
     * Older transactions may not have categoryId, so we fall back
     * to the category name for those records.
     */
    const spendingByCategoryId = new Map();
    const spendingByCategoryName = new Map();

    let totalExpensesMinor = 0;

    for (const transaction of monthlyExpenses) {
      totalExpensesMinor += transaction.amountMinor;

      if (transaction.categoryId) {
        const previous =
          spendingByCategoryId.get(transaction.categoryId) || 0;

        spendingByCategoryId.set(
          transaction.categoryId,
          previous + transaction.amountMinor
        );
      }

      if (transaction.categoryKey) {
        const previous =
          spendingByCategoryName.get(transaction.categoryKey) || 0;

        spendingByCategoryName.set(
          transaction.categoryKey,
          previous + transaction.amountMinor
        );
      }
    }

    /*
     * 5. Calculate spending progress for every budget.
     */
    const budgetProgress = budgets.map((budget) => {
      let spentMinor = 0;

      if (budget.categoryId) {
        spentMinor =
          spendingByCategoryId.get(budget.categoryId) || 0;
      } else if (budget.categoryKey) {
        spentMinor =
          spendingByCategoryName.get(budget.categoryKey) || 0;
      }

      const limitMinor = budget.limitMinor;

      const remainingMinor = limitMinor - spentMinor;

      const percentageUsed =
        limitMinor > 0
          ? Number(((spentMinor / limitMinor) * 100).toFixed(2))
          : 0;

      let status = "on_track";
      let alert = null;

      if (spentMinor > limitMinor) {
        status = "over_budget";
        alert = `You have exceeded your ${budget.category} budget.`;
      } else if (spentMinor === limitMinor && limitMinor > 0) {
        status = "limit_reached";
        alert = `You have reached your ${budget.category} budget limit.`;
      } else if (percentageUsed >= 80) {
        status = "warning";
        alert = `You have used ${percentageUsed}% of your ${budget.category} budget.`;
      }

      /*
       * A completed month is not automatically successful.
       * It is completed only when spending stayed within the limit.
       */
      if (monthCompleted && spentMinor <= limitMinor) {
        status = "completed";
        alert = null;
      }

      return {
        id: budget.id,
        period: budget.period,
        categoryId: budget.categoryId || null,
        category: budget.category,

        limit: toMajorUnits(limitMinor),
        spent: toMajorUnits(spentMinor),
        remaining: toMajorUnits(remainingMinor),

        percentageUsed,
        status,
        alert,

        currency: budget.currency,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      };
    });

    /*
     * 6. Identify categories that have budgets.
     *
     * We use both IDs and names to support older transactions
     * that might not have categoryId.
     */
    const budgetedCategoryIds = new Set(
      budgets
        .map((budget) => budget.categoryId)
        .filter(Boolean)
    );

    const budgetedCategoryNames = new Set(
      budgets
        .map((budget) => budget.categoryKey)
        .filter(Boolean)
    );

    /*
     * 7. Calculate expenses that do not have a corresponding budget.
     *
     * This is important because total expenses should include
     * every expense, not just expenses covered by budgets.
     */
    let unbudgetedExpensesMinor = 0;

    const unbudgetedCategories = new Map();

    for (const transaction of monthlyExpenses) {
      const hasBudget =
        (transaction.categoryId &&
          budgetedCategoryIds.has(transaction.categoryId)) ||
        (transaction.categoryKey &&
          budgetedCategoryNames.has(transaction.categoryKey));

      if (!hasBudget) {
        unbudgetedExpensesMinor += transaction.amountMinor;

        const key =
          transaction.categoryKey || "uncategorized";

        const previous = unbudgetedCategories.get(key) || {
          category: transaction.category,
          amountMinor: 0,
        };

        previous.amountMinor += transaction.amountMinor;

        unbudgetedCategories.set(key, previous);
      }
    }

    /*
     * 8. Calculate summary figures.
     */
    const totalBudgetMinor = budgets.reduce(
      (total, budget) => total + budget.limitMinor,
      0
    );

    const totalBudgetedSpendingMinor = budgetProgress.reduce(
      (total, budget) =>
        total + Math.round(budget.spent * 100),
      0
    );

    const totalRemainingMinor =
      totalBudgetMinor - totalBudgetedSpendingMinor;

    const alertsCount = budgetProgress.filter(
      (budget) =>
        budget.status === "warning" ||
        budget.status === "limit_reached" ||
        budget.status === "over_budget"
    ).length;

    /*
     * 9. Send the result to the frontend.
     */
    return res.status(200).json({
      success: true,
      period,
      monthCompleted,

      summary: {
        totalBudget: toMajorUnits(totalBudgetMinor),

        totalBudgetedSpending: toMajorUnits(
          totalBudgetedSpendingMinor
        ),

        remaining: toMajorUnits(totalRemainingMinor),

        totalExpenses: toMajorUnits(totalExpensesMinor),

        unbudgetedExpenses: toMajorUnits(
          unbudgetedExpensesMinor
        ),

        budgetCount: budgetProgress.length,
        alertsCount,
      },

      budgets: budgetProgress,

      unbudgetedCategories: Array.from(
        unbudgetedCategories.values()
      ).map((item) => ({
        category: item.category,
        spent: toMajorUnits(item.amountMinor),
      })),
    });
  } catch (error) {
    logger.error(
      {
        error: error.message,
        userId: req.user?.id || req.user?._id?.toString(),
      },
      "Failed to calculate budget progress"
    );

    return res.status(500).json({
      success: false,
      message: "Could not calculate budget progress.",
    });
  }
};
