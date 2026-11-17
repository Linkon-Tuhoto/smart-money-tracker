
import mongoose from "mongoose";

import Category from "../models/Category.js";
import { encryptData, decryptData } from "../utils/encryption.js";
import {
  validateCategory,
  validateCategoryUpdate,
} from "../utils/categoryValidation.js";
import { logger } from "../config/logger.js";

function logFailure(error, event) {
  logger.error(
    {
      event,
      errorName: error?.name || "Error",
      errorCode: error?.code || "UNKNOWN",
    },
    "Category operation failed"
  );
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function publicCategory(document, data) {
  return {
    id: document._id,
    name: data.name,
    type: document.type,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function findDuplicateCategory(userId, type, name, excludeId = null) {
  const documents = await Category.find({
    userId,
    type,
  }).lean();

  const normalizedName = normalizeName(name);

  for (const document of documents) {
    if (
      excludeId &&
      document._id.toString() === excludeId.toString()
    ) {
      continue;
    }

    const data = decryptData(document.encryptedData);

    if (
      typeof data.name === "string" &&
      normalizeName(data.name) === normalizedName
    ) {
      return document;
    }
  }

  return null;
}

// POST /api/categories
export async function createCategory(req, res) {
  try {
    const validation = validateCategory(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { name, type } = validation.value;

    const duplicate = await findDuplicateCategory(
      req.user._id,
      type,
      name
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "You already have a category with this name.",
      });
    }

    const encryptedData = encryptData({ name });

    const category = await Category.create({
      userId: req.user._id,
      type,
      encryptedData,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: publicCategory(category, { name }),
    });
  } catch (error) {
    logFailure(error, "category_create_failed");

    return res.status(500).json({
      success: false,
      message: "Unable to create category right now.",
    });
  }
}

// GET /api/categories?type=expense
// GET /api/categories?type=income
// GET /api/categories
export async function listCategories(req, res) {
  try {
    const filter = {
      userId: req.user._id,
    };

    if (req.query.type !== undefined) {
      if (
        typeof req.query.type !== "string" ||
        !["expense", "income"].includes(req.query.type)
      ) {
        return res.status(400).json({
          success: false,
          message: "Category type must be expense or income.",
        });
      }

      filter.type = req.query.type;
    }

    const documents = await Category.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    const categories = documents.map((document) => {
      const data = decryptData(document.encryptedData);
      return publicCategory(document, data);
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    logFailure(error, "category_list_failed");

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve categories right now.",
    });
  }
}

// PATCH /api/categories/:id
export async function updateCategory(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const validation = validateCategoryUpdate(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const { name } = validation.value;

    const duplicate = await findDuplicateCategory(
      req.user._id,
      category.type,
      name,
      category._id
    );

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "You already have a category with this name.",
      });
    }

    category.encryptedData = encryptData({ name });

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category: publicCategory(category, { name }),
    });
  } catch (error) {
    logFailure(error, "category_update_failed");

    return res.status(500).json({
      success: false,
      message: "Unable to update category right now.",
    });
  }
}

// DELETE /api/categories/:id
export async function deleteCategory(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Category deleted. Existing transactions and budgets have not been changed.",
    });
  } catch (error) {
    logFailure(error, "category_delete_failed");

    return res.status(500).json({
      success: false,
      message: "Unable to delete category right now.",
    });
  }
}
