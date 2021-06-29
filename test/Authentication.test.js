let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");

let should = chai.should();
process.env.NODE_ENV = "test";
chai.use(chaiHttp);

describe("Authentication TESTS", () => {
   describe("SIGN UP", () => {
    it("It should  create an API key for the user and store it in the smart contract ", (done) => {
      user = { email: "hajazi@gmail.com" };
      chai
        .request(server)
        .post("/v2/signup")
        .query(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.eql(
            "AN API KEY WAS CREATED FOR YOU WITH SUCCESS ! TRY TO LOGIN NOW "
          );

          done();
        });
    });
  }); 

  describe("LOGIN ", () => {
    it("It should log in the user and sets his api key in the  x-api-key header ", (done) => {
      chai
        .request(server)
        .get("/v2/login")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.message.should.be.eql("Welcome to my IPFS API");

          done();
        });
    });
  });

    describe("LOGOUT", () => {
    it("It should log the user out and set the x-api-key header to 0", (done) => {
      chai
        .request(server)
        .get("/v2/logout")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.eql("logged out successfully");

          done();
        });
    });
  }); 
});
