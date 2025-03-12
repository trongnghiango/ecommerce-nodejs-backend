const { OKResponse, SuccessResponse } = require('../core/success.response');

class ProfileController {
  //
  // eslint-disable-next-line class-methods-use-this
  viewAny = async (req, res, next) => {
    return new OKResponse({
      message: 'OK - Any',
      metadata: {},
    }).send(res);
  };

  //
  // eslint-disable-next-line class-methods-use-this
  viewOwner = async (req, res, next) => {
    return new SuccessResponse({
      message: 'success - Owner',
      // metadata: {}
    }).send(res);
  };
}

module.exports = new ProfileController();
