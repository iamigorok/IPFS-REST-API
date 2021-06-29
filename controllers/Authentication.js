"use strict";

var utils = require("../utils/writer.js");

var User = require("../service/AuthenticationService");
const Web3 = require("web3");
const { v4: uuidv4 } = require("uuid");
var config = require("../config");
const contract = require("../Testnet_Ropsten/contract_ropsten.js");

var Tx = require("ethereumjs-tx").Transaction;

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

module.exports.loginUser = function loginUser(req, res, next) {
  var email = req.swagger.params["email"].value;
  var password = req.swagger.params["password"].value;
  var user_api_key = 0;
  User.loginUser(email, password)
    .then(async function() {
      const user = await APIContract.methods //gets the user api key by calling the users method
        .login(email, password)
        .call({ from: config.api_contract.owner.public_key }, function(
          error,
          result
        ) {
          user_api_key = result;
        });

      if (user_api_key != 0) {
        var tokenString = User.issueToken(user_api_key, email, "user");

        utils.writeResponse(
          res,
          { message: "Welcome to our IPFS API v1", token: tokenString },
          200
        );
        next();
      } else {
        next();
      }
    })
    .catch(function(response) {
      utils.writeResponse(
        res,
        {
          message: "Wrong password/email, try again or please sign up ",
        },
        400,
        "application/json"
      );
    });
};

module.exports.signupUser = function signupUser(req, res, next) {
  var email = req.swagger.params["email"].value;
  var password = req.swagger.params["password"].value;

  User.signupUser(email)
    .then(async function(response) {
      var id_user = uuidv4();

      var tokenString = User.issueToken(id_user, email, "user");
      //console.log(tokenString);

      web3.eth.getTransactionCount(
        config.api_contract.owner.public_key,
        (err, txCount) => {
          var ABI = APIContract.methods
            .signUp(email, password, id_user)
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
                utils.writeResponse(res, {
                  status: "WELCOME TO OUR IPFS API ! TRY TO LOGIN NOW ",
                  token: tokenString,
                });
              }
            })
            .on("error", function(error) {
              console.log(error);
              utils.writeResponse(res, {
                status:
                  "Looks like you already have an account with that email address. Please log in instead. ",
              });
            });
        }
      );
    })
    .catch(function(response) {
      utils.writeResponse(res, {
        status:
          "Something went wrong, connection problem  please try again !  ",
      });
    });
};
