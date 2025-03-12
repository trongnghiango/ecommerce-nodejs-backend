const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Admin';
const COLLECTION_NAME = 'admins';

/**
 * 
    name:
    email:
    password:
    status:
    verify:
    roles:
 */

const adminSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: 100,
      trim: true,
      required: true,
    },
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    verify: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String], // Sử dụng mảng cho các vai trò
      default: ['owner'], // Giá trị mặc định là 'owner'
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    collection: COLLECTION_NAME, // Tên collection
  }
);

module.exports = model(DOCUMENT_NAME, adminSchema);