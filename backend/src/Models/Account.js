
import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    // The account belongs to one authenticated user.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // The account type is visible for filtering.
    // Account names and balances will be encrypted.
    type: {
      type: String,
      enum: ["cash", "mpesa"],
      required: true,
      immutable: true,
    },

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

// For the first version, each user has one cash account
// and one M-Pesa account.
accountSchema.index(
  { userId: 1, type: 1 },
  { unique: true }
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
