"use strict";

var utils = require("../utils/writer.js");
var File = require("../service/FileService");
var Tx = require("ethereumjs-tx").Transaction;
const fs = require("fs");
const fetch = require("node-fetch");
var config = require("../config");
const Web3 = require("web3");
const contract = require("../Testnet_Ropsten/contract_ropsten.js");
const createClient = require("ipfs-http-client");
const ipfsClient = createClient({
  host: config.ipfs_gateway.host,
  port: config.ipfs_gateway.port,
  protocol: config.ipfs_gateway.protocole,
}); // connects to infura ipfs gateway
const privateKey = Buffer(config.api_contract.owner.private_key, "hex"); // sets the private key buffer as hex
if (typeof web3 !== "undefined") {
  var web3 = new Web3(web3.currentProvider);
} else {
  var web3 = new Web3(
    new Web3.providers.HttpProvider(config.network.web3_provider)
  );
}
var APIContract = new web3.eth.Contract(
  config.api_contract.ABI,
  config.api_contract.address
); //GET THE API CONTRACT FOR US

module.exports.getAllFiles = function getAllFiles(req, res, next) {
  var type = req.swagger.params["contentType"].value;
  //var api_key = req.swagger.params["api_key"].value;

  var email = req.auth.email;
  var id = req.auth.sub;
  var data;
  File.getAllFiles(type)
    .then(async function(response) {
      await APIContract.methods //gets the user api key by calling the users method
        .getAllFiles(id, email)
        .call({ from: config.api_contract.owner.public_key })
        .then(function(Result) {
          data = Result.filter((x) => x.title !== "");
          console.log(data + "result");
        });

      utils.writeResponse(res, data, 200);
      next();
    })

    .catch(function(response) {
      utils.writeResponse(
        res,
        { status: "Couldn't fetch the files from IPFS, please try again" },
        400
      );
    });
};
