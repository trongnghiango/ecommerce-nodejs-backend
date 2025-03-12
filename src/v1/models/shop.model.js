const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Shop';
const COLLECTION_NAME = 'shops';

/**
 * 
    name:
    email:
    password:
    status:
    verify:
    roles:
 */

const shopSchema = new Schema(
  {
    name: {
      type: String,
      maxLength: 100,
      trim: true,
    },
    email: { type: String, unique: true, trim: true },
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
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, shopSchema);
