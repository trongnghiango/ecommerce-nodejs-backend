/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const { genPairKey } = require('@/v1/utils/auth.util');
const { createTokenPair } = require('@/v1/auth/authUtils');
// const crypto = require('node:crypto')
const { ApiError } = require('@/v1/core/api-error');
const shopModel = require('@/v1/models/shop.model');
const { getConfig } = require('../configs/autoloadConfig');
const KeyTokenService = require('./keytoken.service');
const { logger } = require('../utils/logger.util');

class AccessService {
  static async logout(userId) {
    return await KeyTokenService.removeKeyTokenByUserId(userId);
  }

  /**
   *
   *
   */
  static async signup({ name, email, password }) {
    try {
      const start = Date.now();
      logger.info('AccessService::');

      // 1. check email exist ??
      const existedEmail = await shopModel.findOne({ email }).lean().exec();
      // console.info({ existedEmail })
      if (existedEmail) {
        return [ApiError.unAuthorized('existedEmail'), null];
      }

      // 2. hashing password
      const passwordHash = await bcrypt.hash(password, 10);

      // 3. store db
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: getConfig().SHOP,
      });

      if (!newShop) return [new Error('[shopModel] Cannot store db'), null];

      // newShop Ok
      //
      // 4. gen key pair
      const { privateKey, publicKey } = genPairKey();

      // console.log({ privateKey, publicKey })

      // 5. save key into db
      const publicKeyStr = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey: publicKey.toString(),
      });

      if (!publicKeyStr)
        return [new Error('[AccessSrv] newShop Ok, but cannot save [key] into db'), null];
      // console.info(crypto.createPublicKey(publicKeyStr))

      // 6. sign token
      const [error, tokens] = await createTokenPair({ userId: newShop._id }, privateKey);
      if (error) return [new Error('[AccessSrv] newShop Ok, but gen tokens error'), null];

      // [7] test verify token
      // const [err, payload] = await decodeToken(
      //   tokens.accessToken,
      //   crypto.createPublicKey(publicKeyStr)
      // )
      // if (err) return [new Error('newShop Ok, but cannot decode tokens'), null]

      // console.info({ payload })
      // payload: {
      //   userId: '6726331182841aa5ef1c4f5c',
      //   iat: 1730556689,
      //   exp: 1730557589
      // } -> khi nao nguoi dung refreshToken? Khi exp - iat sap het han.
      logger.info('AccessService::', Date.now() - start);
      return [
        null,
        {
          name: newShop.name,
          email: newShop.email,
          roles: newShop.roles,
          userId: newShop._id,
          tokens,
        },
      ];
    } catch (error) {
      return [error, null];
    }
  }

  static async signin({ email, password }) {
    try {
      // 1. validation
      // 2. Check if the user exists?
      logger.info(`AccessService::signin::${JSON.stringify({ email })}`);
      const existedShop = await shopModel.findOne({ email }).lean().exec();
      if (!existedShop) return [new Error('Email not registered.')];

      // 3. verify password
      const matchedPassword = await bcrypt.compare(password, existedShop.password);
      if (!matchedPassword) return [ApiError.unAuthorized('Wrong password!!!')];

      // 4. gen key pair
      const { privateKey, publicKey } = genPairKey();

      // 5. save key into db
      const publicKeyStr = await KeyTokenService.createKeyToken({
        userId: existedShop._id,
        publicKey: publicKey.toString(),
      });

      if (!publicKeyStr)
        return [new Error('[AccessSrv] newShop Ok, but cannot save [key] into db')];
      // console.info(crypto.createPublicKey(publicKeyStr))

      // 6. sign token
      const [error, tokens] = await createTokenPair({ userId: existedShop._id }, privateKey);
      if (error) return [new Error('[AccessSrv] newShop Ok, but gen tokens error')];

      logger.info(existedShop._id);
      const result = {
        tokens,
        userId: existedShop._id,
      };

      return [null, result];
    } catch (error) {
      return [error];
    }
  }
}

module.exports = AccessService;
