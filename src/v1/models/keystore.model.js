const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'Key';
const COLLECTION_NAME = 'keys';

const keySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamp: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, keySchema);
