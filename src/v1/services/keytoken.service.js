const { decodeToken } = require('@/v1/auth/authUtils');
const keystoreModel = require('@/v1/models/keystore.model');

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

  static async getKeyToken({ userId }) {
    try {
      return [null, await keystoreModel.findOne({ userId }).lean().exec()];
    } catch (error) {
      return [error];
    }
  }

  static async decodeFromToken({ token }) {
    const [err, result] = await decodeToken(token);
  }
}

module.exports = KeyTokenService;
