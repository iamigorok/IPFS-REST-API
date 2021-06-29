const APIContract = artifacts.require("APIContract");

module.exports = function (deployer) {
  deployer.deploy(APIContract);
};
