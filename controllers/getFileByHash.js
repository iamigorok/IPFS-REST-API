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

module.exports.getFileByHash = function getFileByHash(req, res, next) {
  var hash = req.swagger.params["hash"].value;

  File.getFileByHash(hash)
    .then(async function(response) {
      const ipfsFile = await fetch(
        "https://ipfs.io/ipfs/" + hash // gets the file from ipfs using the public gateway
      )
        .then(async function(data) {
          const buffer = await data.buffer(); //renders the buffer output

          var content_type = await data.headers.get("Content-Type"); //GETS THE CONTENT-TYPE OF THE FILE

          utils.writeResponse(res, buffer, 200, content_type); // sends a response including : buffer+status code+ content type
        })
        .catch(function() {
          console.log("something went wrong with the file download.......");
        });

      next();
    })

    .catch(function(response) {
      utils.writeResponse(
        res,
        { status: "Couldn't fetch the file from IPFS, please try again" },
        400
      );
    });
};
