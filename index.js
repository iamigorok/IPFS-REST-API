"use strict";

var fs = require("fs"),
  path = require("path"),
  http = require("http");
var utils = require("./utils/writer.js");
var app = require("express")();
var swaggerTools = require("swagger-tools");
var jsyaml = require("js-yaml");
var auth = require("./service/AuthenticationService.js");
const { Console } = require("console");
const { nextTick } = require("process");
var serverPort = 3000;
//import my_api_key from "controllers/User.js";
// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, "/swagger.json"),
  controllers: path.join(__dirname, "./controllers"),
  useStubs: process.env.NODE_ENV === "development", // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname, "api/swagger.yaml"), "utf8");
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function(middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain

  app.use(middleware.swaggerMetadata());
  app.use(
    middleware.swaggerSecurity({
      Bearer: auth.verifyToken,
    })
  );

  // Validate Swagger requests
  //app.use(middleware.swaggerValidator({ validateResponse: false }));

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function() {
    console.log(
      "Your server is listening on port %d (http://localhost:%d)",
      serverPort,
      serverPort
    );
    console.log(
      "Swagger-ui is available on http://localhost:%d/docs",
      serverPort
    );
  });
});

module.exports = app;
