const { OKResponse, SuccessResponse } = require("../core/success.response")

class ProfileController {
  //
  viewAny = async (req, res, next) => {

    return new OKResponse({
      message: 'OK - Any', 
      metadata: {}
    }).send(res)
  }

  //
  viewOwner = async (req, res, next) => {

    return new SuccessResponse({
      message: "success - Owner",
      // metadata: {}
    }).send(res);
  }
}

module.exports = new ProfileController()