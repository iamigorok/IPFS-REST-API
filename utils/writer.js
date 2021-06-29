var ResponsePayload = function (code, payload) {
  this.code = code;
  this.payload = payload;
};

exports.respondWithCode = function (code, payload) {
  return new ResponsePayload(code, payload);
};

var writeResponse = (exports.writeResponse = function (response, arg1, arg2, arg3) { // The write response function will handle all the responses regarding the API
  var code;
  var payload;
  var Filepayload;

    if (arg1 && arg1 instanceof ResponsePayload) {
    writeJson(response, arg1.payload, arg1.code);
    return;
  }  

  if (arg2 && Number.isInteger(arg2)) {
    code = arg2;
  } else {
    if (arg1 && Number.isInteger(arg1)) {
      code = arg1;
    }
  }
  if (code && arg1) {
    payload = arg1;
  } else if (arg1) {
    payload = arg1;
  }

  if(!arg3){
    // if no content-type specified, we default to  application/json
    arg3="application/json";
  }

  if (!code) {
    // if no response code given, we default to 200
    code = 200;
  }

  if (typeof payload === "object") { //gets the payload object
    
   
    payload = JSON.stringify(payload);// parses the payload into a json string
   Filepayload= JSON.parse(payload) //parsing the string payload to json in order to get the type of the payload 
   //returns an object like : {"type":"Buffer", "data": []}
   
  }
//interesting stuff starts here, if the payload has a type buffer then, we are dealing with a file
//so we must set the right headers accordingly 
//arg3 will include the content-type of the file 
  if(Filepayload["type"]=="Buffer"){ 
    
    
  
    
     response.writeHead( code , {"Content-Type": arg3}  );
    
    response.end(arg1, "Bin64");

  }else{// else it is a simple json response that has to be rendered..

    response.writeHead( code , {"Content-Type": arg3 });

    response.end(payload);

  }
  
});

