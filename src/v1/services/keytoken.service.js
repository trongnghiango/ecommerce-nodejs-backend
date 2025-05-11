const { db, keyStoresTable } = require('../databases/drizzle');
const { eq, and } = require('drizzle-orm');
const { logger } = require('../utils/logger.util');
const { ApiError } = require('../core/api-error');

/**
 * @typedef {Object} KeyTokenPayload
 * @property {number} userId - The ID of the user (shop).
 * @property {string} publicKey - The public key string.
 * @property {string} [refreshToken] - The current active refresh token (optional).
 * @property {string[]} [refreshTokensUsed] - Array of refresh tokens that have been used (optional).
 */

/**
 * @typedef {Object} KeyTokenFromDb
 * @property {number} id - Auto-incrementing ID from DB.
 * @property {number} userId
 * @property {string} publicKey
 * @property {string | null} refreshToken - Current active refresh token.
 * @property {string[] | null} refreshTokensUsed - Previously used refresh tokens.
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/** @typedef {KeyTokenFromDb} KeyToken */

class KeyTokenService {
  /**
   * Creates or updates a key token for a user.
   * If a record for the userId exists, it updates the publicKey and optionally the refreshToken.
   * @param {KeyTokenPayload} payload - The data for the key token.
   * @returns {Promise<string | null>} The stored public key, or null if failed.
   * @throws {ApiError} If database operation fails.
   */
  static async createKeyToken({ userId, publicKey, refreshToken }) {
    try {
      /** @type Partial<Omit<KeyTokenFromDb, 'id' | 'createdAt'>> */
      const valuesToSet = { publicKey, updatedAt: new Date() };
      if (refreshToken) {
        valuesToSet.refreshToken = refreshToken;
      }

      const result = await db
        .insert(keyStoresTable)
        .values({ userId, publicKey, refreshToken, updatedAt: new Date(), createdAt: new Date() }) // refreshTokensUsed defaults to [] or NULL
        .onConflictDoUpdate({
          target: keyStoresTable.userId,
          set: valuesToSet,
        })
        .returning({ publicKey: keyStoresTable.publicKey });

      if (!result || result.length === 0) {
        logger.error('Failed to create/update key token, no result returned.', {
          userId,
          label: 'KEY_TOKEN_SRV',
        });
        return null; // Or throw ApiError
      }
      return result[0].publicKey;
    } catch (error) {
      logger.error('Error in createKeyToken:', {
        message: error.message,
        userId,
        label: 'KEY_TOKEN_SRV',
      });
      throw ApiError.internalError(`Database error while managing key token: ${error.message}`);
    }
  }

  /**
   * Retrieves a key token by user ID.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<KeyToken | null>} The key token object, or null if not found.
   * @throws {ApiError} If database operation fails.
   */
  static async getKeyTokenByUserId(userId) {
    try {
      const keyTokenArr = await db
        .select()
        .from(keyStoresTable)
        .where(eq(keyStoresTable.userId, userId))
        .limit(1);
      return keyTokenArr.length > 0 ? keyTokenArr[0] : null;
    } catch (error) {
      logger.error('Error in getKeyTokenByUserId:', {
        message: error.message,
        userId,
        label: 'KEY_TOKEN_SRV',
      });
      throw ApiError.internalError(`Database error while fetching key token: ${error.message}`);
    }
  }

  /**
   * Retrieves a key token by an active refresh token.
   * @param {string} refreshToken - The refresh token to search for.
   * @returns {Promise<KeyToken | null>} The key token object, or null if not found or token is already used.
   * @throws {ApiError} If database operation fails.
   */
  static async getKeyTokenByRefreshToken(refreshToken) {
    try {
      const keyTokenArr = await db
        .select()
        .from(keyStoresTable)
        .where(
          and(
            eq(keyStoresTable.refreshToken, refreshToken)
            // Optional: Ensure it's not in refreshTokensUsed if that logic is strict here
            // sql`NOT (${refreshToken} = ANY(${keyStoresTable.refreshTokensUsed}))`
          )
        )
        .limit(1);
      return keyTokenArr.length > 0 ? keyTokenArr[0] : null;
    } catch (error) {
      logger.error('Error in getKeyTokenByRefreshToken:', {
        message: error.message,
        label: 'KEY_TOKEN_SRV',
      });
      throw ApiError.internalError(
        `Database error while fetching key token by refresh token: ${error.message}`
      );
    }
  }

  /**
   * Removes a key token by user ID.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<boolean>} True if a key token was deleted, false otherwise.
   * @throws {ApiError} If database operation fails.
   */
  static async removeKeyTokenByUserId(userId) {
    try {
      const result = await db
        .delete(keyStoresTable)
        .where(eq(keyStoresTable.userId, userId))
        .returning({ id: keyStoresTable.id });
      return result.length > 0;
    } catch (error) {
      logger.error('Error in removeKeyTokenByUserId:', {
        message: error.message,
        userId,
        label: 'KEY_TOKEN_SRV',
      });
      throw ApiError.internalError(`Database error while removing key token: ${error.message}`);
    }
  }

  /**
   * Updates an existing KeyToken with a new public key, new refresh token,
   * and adds the old refresh token to the list of used tokens.
   * Critical for secure refresh token rotation.
   * @param {Object} params
   * @param {number} params.userId
   * @param {string} params.newPublicKey
   * @param {string} params.newRefreshToken
   * @param {string} params.oldRefreshToken - The refresh token that was just used.
   * @returns {Promise<KeyToken | null>} The updated KeyToken or null if update failed.
   * @throws {ApiError} If the KeyStore for the user is not found or DB update fails.
   */
  static async updateKeyTokenWithNewRefreshToken({
    userId,
    newPublicKey,
    newRefreshToken,
    oldRefreshToken,
  }) {
    try {
      // Drizzle's way to append to an array and update other fields:
      // This requires a raw SQL fragment or ensuring your DB schema default for refreshTokensUsed is an empty array.
      // For PostgreSQL, you can use array_append if the column exists and is an array.
      // If refreshTokensUsed can be NULL, you might need COALESCE.
      const result = await db
        .update(keyStoresTable)
        .set({
          publicKey: newPublicKey,
          refreshToken: newRefreshToken,
          // Append oldRefreshToken to refreshTokensUsed array.
          // This is a bit tricky with Drizzle's typed API for array appends if the column can be null.
          // Using sql`` for more complex array operations might be needed or handle it in app logic.
          // A simpler approach if `refreshTokensUsed` is guaranteed to be an array (e.g. default `[]`):
          // refreshTokensUsed: sql`${keyStoresTable.refreshTokensUsed} || ARRAY[${oldRefreshToken}]`,
          // If it can be null:
          refreshTokensUsed: sql`COALESCE(${keyStoresTable.refreshTokensUsed}, ARRAY[]::text[]) || ARRAY[${oldRefreshToken}]`,
          updatedAt: new Date(),
        })
        .where(eq(keyStoresTable.userId, userId))
        .returning();

      if (!result || result.length === 0) {
        logger.error(
          'Failed to update key token with new refresh token, user keystore not found or update failed.',
          { userId, label: 'KEY_TOKEN_SRV' }
        );
        // This is critical. If we can't update, the old RT might still be considered valid by some checks.
        throw ApiError.internalError('Failed to update session security keys.');
      }
      return result[0];
    } catch (error) {
      logger.error('Error in updateKeyTokenWithNewRefreshToken:', {
        message: error.message,
        userId,
        label: 'KEY_TOKEN_SRV',
      });
      throw ApiError.internalError(
        `Database error during refresh token rotation: ${error.message}`
      );
    }
  }
}

module.exports = KeyTokenService;
