const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Account';
const COLLECTION_NAME = 'accounts';

/**
 * 
    email:
    password:
    account_type: // Loại tài khoản (admin, shop, user, manager, creator)
    userId:  // ID của người dùng trong các collection khác
 */

const accountSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true }, // Tham chiếu đến Role
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "userType", // Tham chiếu động đến Admin/Shop/Customer
    },
    userType: {
      type: String,
      enum: ["Admin", "Shop", "Customer"], // Khớp với tên model
      required: true,
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, accountSchema);