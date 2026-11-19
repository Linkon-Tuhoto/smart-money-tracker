
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // The user who owns this transaction.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // Encrypted transaction data.
    // Plaintext financial details are not stored in separate fields.
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

    // Fingerprint for detecting duplicate M-Pesa messages.
    // Manual transactions can leave this field unset.
    messageFingerprint: {
      type: String,
      default: undefined,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for retrieving a user's transactions, newest first.
transactionSchema.index({
  userId: 1,
  createdAt: -1,
});

// Enforce one fingerprint per user.
// The partial index excludes documents without a string fingerprint.
transactionSchema.index(
  {
    userId: 1,
    messageFingerprint: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      messageFingerprint: { $type: "string" },
    },
  }
);

// Create the Mongoose model.
const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

export default Transaction;
