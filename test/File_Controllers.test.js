let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../index");

let fs = require("fs");
let should = chai.should();
process.env.NODE_ENV = "test";
chai.use(chaiHttp);

describe("TESTING FILE CONTROLLERS", () => {
  describe("UPLOADING A FILE TO IPFS", () => {
    it("It should  upload the file to IPFS & store its title and hash in the smart contract ", (done) => {
      const file_re = fs.readFileSync(
        "/Users/mpfa/dev/swagger-rest-api/assets/job-opportunities.png"
      );
      console.log(file_re);
      file = { Title: "job", file: file_re };
      chai
        .request(server)
        .post("/v2/file/uploadFile")
        .query({ Title: "job" })
        .attach(
          "file",
          "/Users/mpfa/dev/swagger-rest-api/assets/job-opportunities.png",
          "job-opportunities.png"
        )

        .end((err, res) => {
          res.should.have.status(200);
          res.body.status.should.be.eql("The file was uploaded with success");

          done();
        });
    });
  });

  describe("Getting the file by its title ", () => {
    it("It should  upload the file to IPFS & store its title and hash in the smart contract ", (done) => {
      const file_re = fs.readFileSync(
        "/Users/mpfa/dev/swagger-rest-api/assets/job-opportunities.png"
      );
      console.log(file_re);
      file = { Title: "job", file: file_re };
      chai
        .request(server)
        .get("/v2/file/getFileByTitle")
        .query({ title: "job" })

        .end((err, res) => {
          res.should.have.status(200);


          done();
        });
    });
  });
});
