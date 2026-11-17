
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import { encryptData, decryptData } from "../utils/encryption.js";
import { validateBudget } from "../utils/budgetValidation.js";
import { logger } from "../config/logger.js";

function isValidId(id) {
  return mongoose.isValidObjectId(id);
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

function publicBudget(document, data) {
  return {
    id: document._id,
    period: data.period,
    categoryId: data.categoryId || null,
    category: data.category || "Uncategorized",
    limit:
      Number.isSafeInteger(data.limitMinor) &&
      data.limitMinor >= 0
        ? data.limitMinor / 100
        : 0,
    currency: data.currency || "KES",
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

// Get an expense category owned by the authenticated user.
async function getExpenseCategory(userId, categoryId) {
  if (!isValidId(categoryId)) {
    return { error: "Select a valid expense category." };
  }

  const categoryDocument = await Category.findOne({
    _id: categoryId,
    userId,
    type: "expense",
  });

  if (!categoryDocument) {
    return {
      error: "The selected category was not found among your expense categories.",
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
      category: categoryData.name.trim(),
    },
  };
}

// Check whether this user already has a budget for this category and month.
// Category IDs are preferred; the name check also protects older budgets
// that were saved before category IDs were introduced.
async function findDuplicateBudget(
  userId,
  period,
  categoryId,
  categoryName,
  excludeId = null
) {
  const documents = await Budget.find({
    userId,
    period,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).lean();

  const normalizedName = categoryName.trim().toLowerCase();

  for (const document of documents) {
    const data = decryptData(document.encryptedData);

    if (
      data.categoryId &&
      data.categoryId.toString() === categoryId.toString()
    ) {
      return true;
    }

    // Legacy budget fallback.
    if (
      !data.categoryId &&
      typeof data.category === "string" &&
      data.category.trim().toLowerCase() === normalizedName
    ) {
      return true;
    }
  }

  return false;
}

// CREATE BUDGET
// POST /api/budgets
export async function createBudget(req, res) {
  try {
    const validation = validateBudget(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const data = validation.value;

    const categoryResult = await getExpenseCategory(
      req.user._id,
      data.categoryId
    );

    if (categoryResult.error) {
      return res.status(400).json({
        success: false,
        message: categoryResult.error,
      });
    }

    const categoryData = categoryResult.category;

    const duplicate = await findDuplicateBudget(
      req.user._id,
      data.period,
      categoryData.categoryId,
      categoryData.category
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "A budget for this category already exists for the selected month.",
      });
    }

    const encryptedData = encryptData({
      period: data.period,
      categoryId: categoryData.categoryId,
      category: categoryData.category,
      limitMinor: data.limitMinor,
      currency: "KES",
    });

    const budget = await Budget.create({
      userId: req.user._id,
      period: data.period,
      encryptedData,
    });

    const savedData = decryptData(budget.encryptedData);

    logger.info(
      { event: "budget_created" },
      "Budget created"
    );

    return res.status(201).json({
      success: true,
      message: "Budget created successfully.",
      budget: publicBudget(budget, savedData),
    });
  } catch (error) {
    logFailure(
      "budget_create_failed",
      error,
      "Unable to create budget"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create this budget right now.",
    });
  }
}

// LIST BUDGETS
// GET /api/budgets
// Optional: GET /api/budgets?period=YYYY-MM
export async function listBudgets(req, res) {
  try {
    const filter = {
      userId: req.user._id,
    };

    if (req.query.period !== undefined) {
      if (
        typeof req.query.period !== "string" ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.period)
      ) {
        return res.status(400).json({
          success: false,
          message: "Period must use YYYY-MM format.",
        });
      }

      filter.period = req.query.period;
    }

    const documents = await Budget.find(filter)
      .sort({ period: -1, createdAt: -1 })
      .lean();

    const budgets = documents.map((document) => {
      const data = decryptData(document.encryptedData);
      return publicBudget(document, data);
    });

    return res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    logFailure(
      "budget_list_failed",
      error,
      "Unable to retrieve budgets"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve budgets right now.",
    });
  }
}

// UPDATE BUDGET
// PATCH /api/budgets/:id
export async function updateBudget(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID.",
      });
    }

    const validation = validateBudget(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const existingBudget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existingBudget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    const data = validation.value;

    const categoryResult = await getExpenseCategory(
      req.user._id,
      data.categoryId
    );

    if (categoryResult.error) {
      return res.status(400).json({
        success: false,
        message: categoryResult.error,
      });
    }

    const categoryData = categoryResult.category;

    const duplicate = await findDuplicateBudget(
      req.user._id,
      data.period,
      categoryData.categoryId,
      categoryData.category,
      existingBudget._id
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "Another budget for this category already exists for the selected month.",
      });
    }

    const updatedData = {
      period: data.period,
      categoryId: categoryData.categoryId,
      category: categoryData.category,
      limitMinor: data.limitMinor,
      currency: "KES",
    };

    existingBudget.period = data.period;
    existingBudget.encryptedData = encryptData(updatedData);

    await existingBudget.save();

    logger.info(
      { event: "budget_updated" },
      "Budget updated"
    );

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully.",
      budget: publicBudget(existingBudget, updatedData),
    });
  } catch (error) {
    logFailure(
      "budget_update_failed",
      error,
      "Unable to update budget"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update this budget right now.",
    });
  }
}

// DELETE BUDGET
// DELETE /api/budgets/:id
export async function deleteBudget(req, res) {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget ID.",
      });
    }

    const deleted = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    logger.info(
      { event: "budget_deleted" },
      "Budget deleted"
    );

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully.",
    });
  } catch (error) {
    logFailure(
      "budget_delete_failed",
      error,
      "Unable to delete budget"
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete this budget right now.",
    });
  }
}
