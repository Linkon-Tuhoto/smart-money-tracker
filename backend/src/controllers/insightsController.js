
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { decryptData } from "../utils/encryption.js";
import {logger} from "../config/logger.js";

// Kenya uses East Africa Time (UTC+3).
const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function logFailure(event, error) {
  logger.error(
    {
      event,
      errorName: error?.name || "Error",
      errorCode: error?.code || "UNKNOWN",
    },
    "Unable to process financial records"
  );
}

function getKenyaMonthBounds(date, monthOffset = 0) {
  const kenyaDate = new Date(date.getTime() + KENYA_OFFSET_MS);

  const year = kenyaDate.getUTCFullYear();
  const month = kenyaDate.getUTCMonth() + monthOffset;

  const start = new Date(
    Date.UTC(year, month, 1) - KENYA_OFFSET_MS
  );

  const end = new Date(
    Date.UTC(year, month + 1, 1) - KENYA_OFFSET_MS
  );

  return { start, end };
}

function getKenyaPeriod(date) {
  const kenyaDate = new Date(date.getTime() + KENYA_OFFSET_MS);

  const year = kenyaDate.getUTCFullYear();
  const month = String(kenyaDate.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function toMoney(amountMinor) {
  return Number((amountMinor / 100).toFixed(2));
}

function formatMonth(date) {
  return new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

function percentageChange(current, previous) {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return Number(
    (((current - previous) / previous) * 100).toFixed(1)
  );
}

function normalizeCategory(category) {
  if (typeof category !== "string" || !category.trim()) {
    return "uncategorized";
  }

  return category.trim().toLowerCase();
}

function summarizeTransactions(transactions, start, end) {
  const summary = {
    incomeMinor: 0,
    expenseMinor: 0,
    titheMinor: 0,
    transferMinor: 0,
    categories: {},
    transactionCount: 0,
  };

  for (const item of transactions) {
    const data = item.data;

    if (!data || !data.transactionDate) {
      continue;
    }

    const date = new Date(data.transactionDate);

    if (
      Number.isNaN(date.getTime()) ||
      date < start ||
      date >= end
    ) {
      continue;
    }

    const amount = data.amountMinor;

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      continue;
    }

    summary.transactionCount += 1;

    if (data.type === "income") {
      summary.incomeMinor += amount;
    } else if (data.type === "expense") {
      summary.expenseMinor += amount;

      const category =
        typeof data.category === "string" && data.category.trim()
          ? data.category.trim()
          : "Uncategorized";

      summary.categories[category] =
        (summary.categories[category] || 0) + amount;
    } else if (data.type === "tithe") {
      summary.titheMinor += amount;
    } else if (
      data.type === "transfer" ||
      data.type === "withdrawal"
    ) {
      // Transfers and withdrawals are tracked separately from spending.
      summary.transferMinor += amount;
    }
  }

  return summary;
}

function buildBudgetProgress(budgetDocuments, spendingByCategory) {
  const budgetProgress = [];

  for (const document of budgetDocuments) {
    try {
      const data = decryptData(document.encryptedData);

      if (
        typeof data.category !== "string" ||
        !data.category.trim() ||
        !Number.isSafeInteger(data.limitMinor) ||
        data.limitMinor <= 0
      ) {
        logFailure(
          "invalid_budget_data",
          new Error("Invalid decrypted budget data")
        );
        continue;
      }

      const category = data.category.trim();
      const categoryKey = normalizeCategory(category);
      const amountSpentMinor =
        spendingByCategory.get(categoryKey) || 0;

      const remainingMinor = data.limitMinor - amountSpentMinor;

      const percentageUsed = Math.round(
        (amountSpentMinor / data.limitMinor) * 10000
      ) / 100;

      let status = "on_track";
      let alert = null;

      if (percentageUsed > 100) {
        status = "over_budget";
        alert =
          `You have exceeded your ${category} budget by ` +
          `KSh ${toMoney(Math.abs(remainingMinor)).toLocaleString("en-KE")}.`;
      } else if (percentageUsed >= 100) {
        status = "limit_reached";
        alert = `You have reached your ${category} budget limit.`;
      } else if (percentageUsed >= 80) {
        status = "warning";
        alert =
          `You have used ${percentageUsed}% of your ` +
          `${category} budget.`;
      }

      budgetProgress.push({
        id: document._id,
        period: document.period,
        category,
        currency: data.currency || "KES",
        budgetLimit: toMoney(data.limitMinor),
        amountSpent: toMoney(amountSpentMinor),
        remaining: toMoney(remainingMinor),
        percentageUsed,
        status,
        alert,
      });
    } catch (error) {
      // Never log decrypted financial data or the encrypted payload.
      logFailure("budget_decryption_failed", error);
    }
  }

  return budgetProgress;
}

// GET /api/insights
export async function getSpendingInsights(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();

    const currentMonth = getKenyaMonthBounds(now, 0);
    const previousMonth = getKenyaMonthBounds(now, -1);
    const currentPeriod = getKenyaPeriod(now);

    // Compare equivalent elapsed periods instead of comparing
    // a partial current month with the entire previous month.
    const elapsedCurrentMs = Math.max(
      0,
      Math.min(
        now.getTime() - currentMonth.start.getTime(),
        currentMonth.end.getTime() - currentMonth.start.getTime()
      )
    );

    const previousComparableEnd = new Date(
      Math.min(
        previousMonth.start.getTime() + elapsedCurrentMs,
        previousMonth.end.getTime()
      )
    );

    // Every query is restricted to the authenticated user's records.
    const [transactionDocuments, budgetDocuments] = await Promise.all([
      Transaction.find({ userId }).lean(),
      Budget.find({
        userId,
        period: currentPeriod,
      }).lean(),
    ]);

    // Decrypt individual records. A single bad record should not
    // crash every insight, but the response will disclose incomplete data.
    const decryptedTransactions = [];
    let failedTransactionCount = 0;

    for (const transaction of transactionDocuments) {
      try {
        const data = await decryptData(transaction.encryptedData);

        decryptedTransactions.push({ data });
      } catch (error) {
        failedTransactionCount += 1;
        logFailure("transaction_decryption_failed", error);
      }
    }

    const current = summarizeTransactions(
      decryptedTransactions,
      currentMonth.start,
      now
    );

    const previous = summarizeTransactions(
      decryptedTransactions,
      previousMonth.start,
      previousComparableEnd
    );

    const totalOutflowMinor =
      current.expenseMinor + current.titheMinor;

    const previousOutflowMinor =
      previous.expenseMinor + previous.titheMinor;

    const categoryEntries = Object.entries(current.categories)
      .sort((a, b) => b[1] - a[1]);

    const topCategories = categoryEntries.slice(0, 5).map(
      ([category, amountMinor]) => ({
        category,
        amount: toMoney(amountMinor),
        shareOfExpenses: current.expenseMinor
          ? Number(
              ((amountMinor / current.expenseMinor) * 100).toFixed(1)
            )
          : 0,
      })
    );

    // Reuse the same category totals for budget progress.
    const spendingByCategory = new Map();

    for (const [category, amountMinor] of categoryEntries) {
      const key = normalizeCategory(category);

      spendingByCategory.set(
        key,
        (spendingByCategory.get(key) || 0) + amountMinor
      );
    }

    const budgetProgress = buildBudgetProgress(
      budgetDocuments,
      spendingByCategory
    );

    const change = percentageChange(
      totalOutflowMinor,
      previousOutflowMinor
    );

    const kenyaNow = new Date(now.getTime() + KENYA_OFFSET_MS);
    const daysElapsed = Math.max(1, kenyaNow.getUTCDate());

    const dailyAverageMinor = Math.round(
      totalOutflowMinor / daysElapsed
    );

    const insights = [];

    if (current.transactionCount === 0) {
      insights.push({
        type: "info",
        title: "No transactions recorded this month",
        message:
          "Add or import your transactions to start receiving useful spending insights.",
      });
    }

    if (categoryEntries.length > 0) {
      const [category, amountMinor] = categoryEntries[0];

      insights.push({
        type: "info",
        title: "Your biggest spending category",
        message:
          `${category} is your highest recorded expense category this month, ` +
          `at KSh ${toMoney(amountMinor).toLocaleString("en-KE")}.`,
      });
    }

    if (change !== null && previousOutflowMinor > 0) {
      if (change >= 20) {
        insights.push({
          type: "warning",
          title: "Spending has increased",
          message:
            `Your recorded expenses and tithes are ${change}% higher ` +
            "than the equivalent elapsed period last month.",
        });
      } else if (change <= -20) {
        insights.push({
          type: "success",
          title: "Spending has decreased",
          message:
            `Your recorded expenses and tithes are ${Math.abs(change)}% lower ` +
            "than the equivalent elapsed period last month.",
        });
      } else {
        insights.push({
          type: "info",
          title: "Spending is relatively stable",
          message:
            "Your recorded outflow is within 20% of the equivalent elapsed period last month.",
        });
      }
    } else if (
      previousOutflowMinor === 0 &&
      totalOutflowMinor > 0
    ) {
      insights.push({
        type: "info",
        title: "Building your spending history",
        message:
          "There is no recorded outflow for the comparable period last month, so a meaningful percentage comparison is not available yet.",
      });
    }

    for (const budget of budgetProgress) {
      if (!budget.alert) {
        continue;
      }

      insights.push({
        type: budget.status === "over_budget" ||
          budget.status === "limit_reached"
          ? "warning"
          : "info",
        title:
          budget.status === "over_budget"
            ? "Budget exceeded"
            : budget.status === "limit_reached"
              ? "Budget limit reached"
              : "Budget warning",
        message: budget.alert,
        category: budget.category,
      });
    }

    const remainingMinor =
      current.incomeMinor - totalOutflowMinor;

    if (
      current.incomeMinor > 0 &&
      remainingMinor < 0
    ) {
      insights.push({
        type: "warning",
        title: "Outflow exceeds recorded income",
        message:
          "Your recorded expenses and tithes exceed your recorded income this month. Check for missing income or spending paid from earlier savings.",
      });
    }

    return res.status(200).json({
      success: true,
      period: {
        currentMonth: formatMonth(currentMonth.start),
        previousMonth: formatMonth(previousMonth.start),
        timezone: "Africa/Nairobi",
        comparison: "equivalent_elapsed_period",
      },
      summary: {
        currency: "KES",
        income: toMoney(current.incomeMinor),
        expenses: toMoney(current.expenseMinor),
        tithes: toMoney(current.titheMinor),
        totalOutflow: toMoney(totalOutflowMinor),
        remainingAfterRecordedOutflow: toMoney(remainingMinor),
        previousMonthOutflow: toMoney(previousOutflowMinor),
        outflowChangePercent: change,
        averageDailyOutflow: toMoney(dailyAverageMinor),
        transactionCount: current.transactionCount,
      },
      topCategories,
      budgets: {
        period: currentPeriod,
        count: budgetProgress.length,
        alertsCount: budgetProgress.filter(
          (budget) => budget.alert !== null
        ).length,
        items: budgetProgress,
      },
      insights,
      dataQuality: {
        incomplete: failedTransactionCount > 0,
        failedTransactionCount,
      },
      note:
        failedTransactionCount > 0
          ? "Some transaction records could not be decrypted. These results may be incomplete; check server logs for the failure event."
          : "Insights are based on recorded transactions. Missing or incorrectly categorized transactions can affect the results.",
    });
  } catch (error) {
    logFailure("spending_insights_failed", error);

    return res.status(500).json({
      success: false,
      message: "Could not generate spending insights.",
    });
  }
}
