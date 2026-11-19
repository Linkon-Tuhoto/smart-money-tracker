
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // The category belongs to one authenticated user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // Expense categories and income sources are kept separate.
    type: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },

    // The category name is encrypted before being stored.
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

// Helps retrieve a user's categories by type efficiently.
categorySchema.index({ userId: 1, type: 1 });

// Model registration.
const Category = mongoose.model("Category", categorySchema);

export default Category;
