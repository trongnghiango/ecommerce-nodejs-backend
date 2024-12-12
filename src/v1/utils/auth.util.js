const crypto = require('node:crypto');

module.exports = {
  /**
   * create {}
   * @returns {object}
   */
  genPairKey: () =>
    crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    }),
};
