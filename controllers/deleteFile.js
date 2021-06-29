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
module.exports.deleteFile = function deleteFile(req, res, next) {
  var title = req.swagger.params["title"].value;

  var email = req.auth.email;
  var id = req.auth.sub;

  File.deleteFile(title)
    .then(async function(response) {
      web3.eth.getTransactionCount(
        config.api_contract.owner.public_key,
        (err, txCount) => {
          var ABI = APIContract.methods
            .deleteFile(title, id, email) //updates the hash of the file stored in the smart contract
            .encodeABI();
          // Build the transaction
          const txObject = {
            from: config.api_contract.owner.public_key,
            nonce: web3.utils.toHex(txCount),
            to: config.api_contract.address,
            value: web3.utils.toHex(web3.utils.toWei("0", "ether")),
            gasLimit: web3.utils.toHex(2100000),
            gasPrice: web3.utils.toHex(web3.utils.toWei("6", "gwei")),
            data: ABI,
          };
          // Sign the transaction
          const tx = new Tx(txObject, {
            chain: "ropsten",
            hardfork: "petersburg",
          });
          tx.sign(privateKey);

          const serializedTx = tx.serialize();
          const raw = "0x" + serializedTx.toString("hex");

          // Broadcast the transaction
          const transaction = web3.eth
            .sendSignedTransaction(raw)
            .on("receipt", function(receipt) {
              if (receipt["status"] == true) {
                utils.writeResponse(
                  res,
                  {
                    status: "The file was deleted with success",
                  },
                  200
                );
              }
            })
            .on("error", function(error) {
              utils.writeResponse(res, {
                status:
                  "Something went wrong trying to delete your file, please try again in a moment !  ",
              });
            });
        }
      );
    })
    .catch(function(response) {
      utils.writeResponse(
        res,
        { status: "Something went wrong, please check your network" },
        400
      );
    });
};
