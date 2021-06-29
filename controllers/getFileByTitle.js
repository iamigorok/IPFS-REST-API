"use strict";

var utils = require("../utils/writer.js");
var File = require("../service/FileService");
var Tx = require("ethereumjs-tx").Transaction;
const fs = require("fs");
const fetch = require("node-fetch");
var config = require("../config");
const Web3 = require("web3");

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

module.exports.getFileByTitle = function getFileByTitle(req, res, next) {
  var title = req.swagger.params["title"].value;
  var hash = ""; //initializing the hash of the file
  var email = req.auth.email;
  var id = req.auth.sub;
  console.log(title);
  File.getFileByTitle(title)
    .then(async function(response) {
      await APIContract.methods //gets the user api key by calling the users method
        .getHashOfFile(title, id, email)
        .call({ from: config.api_contract.owner.public_key })
        .then(function(Result) {
          hash = Result;
        });

      const ipfsFile = await fetch(
        "https://ipfs.io/ipfs/" + hash //hash of the file sent from the smart contract
      )
        .then(async function(data) {
          const buffer = await data.buffer(); //renders the tput as a buffer

          var content_type = await data.headers.get("Content-Type"); //GETS THE CONTENT-TYPE OF THE FILE =
          console.log(content_type);
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
