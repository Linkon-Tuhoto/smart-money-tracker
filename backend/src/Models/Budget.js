
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    // The owner of this budget.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // Month in YYYY-MM format, e.g. 2026-10.
    // This is metadata used to find a month's budgets.
    period: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    // Category and spending limit are encrypted together.
    encryptedData: {
      ciphertext: {
        type: String,
        required: true,
      },
      iv: {
        type: String,
        required: true,
      },
      authTag: {
        type: String,
        required: true,
      },
      keyVersion: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Efficiently retrieve budgets for a user and month.
budgetSchema.index({ userId: 1, period: 1 });

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
