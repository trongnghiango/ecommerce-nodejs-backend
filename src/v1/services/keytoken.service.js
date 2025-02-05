const keystoreModel = require('@/v1/models/keystore.model');

/**
 * @typedef {Array<(Error|null), (Result|null)>} ResultWithError
 */

// Ví dụ về kiểu Result
/**
 * @typedef {Object} Result
 * @property {string} userId - 
 * @property {string} publicKey .
 */

class KeyTokenService {
  static async createKeyToken({ userId, publicKey }) {
    // const publicKeyStr = publicKey.toString()
    const keytoken = await keystoreModel
      .findOneAndUpdate(
        { userId },
        { publicKey },
        {
          new: true,
          upsert: true,
        }
      )
      .lean();
    return keytoken ? keytoken.publicKey : null;
  }

  /**
   * 
   * @param {{userId: String}} param0 
   * @returns {Promise<ResultWithError>} Mảng chứa Error và Result.
   */
  static async getKeyToken({ userId }) {
    try {
      return [null, await keystoreModel.findOne({ userId }).lean().exec()];
    } catch (error) {
      return [error];
    }
  }

  static async removeKeyTokenByUserId(userId) {
    return await keystoreModel.remove(userId)
  }

}

module.exports = KeyTokenService;
