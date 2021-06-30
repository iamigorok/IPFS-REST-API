# IPFS REST API

## Overview

I was lucky enough to work during my summer internship on this RESTful API that I connected to a smart contract deployed on the Ethereum blockchain. The API allows users  to call all the files they have stored on the IPFS network in a user friendly way. There is no need to connect a wallet to sign a transaction or to communicate any sensitive data to the API, since all the calls to the smart contract are delegated to the owner of the contract (acts as middleware).

## Payment

The smart contract can also include a payment option so that only paid subscriptions would have access to the resources of the API. Payment would be necessary since the POST & PUT requests use transactions that consume gas. The owner can add subscription plans that take into consideration the total number of files that can be owned by each user...

## Network

For now the API smart contract is deployed on the Ropsten testnet.

```no-highlight
Contract Address : 0x9E4524Cc47C05F138c42d2449d1B449ffdFF35Ac
Owner Address : 0xc119f52428aCd711D9fBb71B921f7736504e2864
```

## Authentication

Access to the API is granted by providing your email and password. The smart contract will be called to verify the credentials provided by the user.

```no-highlight
GET v1/ipfs/login?email=soufiane@gmail.com&password=*** HTTP/1.1

{
    "status": {
        "text": "OK",
        "status_code": 200,
        "description": "Logged in successfully"
    },
    "jwt_token": {
       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmY3MjIwNS0xY2FlLTRmY2EtYmNjYy00ZjIxYzkyYjYzOTUiLCJlbWFpbCI6ImhhamF6aUBnbWFpbC5jb20iLCJpc3MiOiJTT1VGSUFORSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjI0ODI2MjcwfQ.p4JNkagUj1aINamZ5SHItl02RFwrH8fyRXnfvRTNOT4
    }
}
```

## API Versioning

The first part of the URI path specifies the API version you wish to access in the format `v{version_number}`.

For example, version 1 of the API (most current) is accessible via:

```no-highlight
https://localhost/v1/ipfs
```

## HTTP requests

All API requests are made by sending a secure HTTPS request using one of the following methods, depending on the action being taken:

- `POST` Create a resource
- `PUT` Update a resource
- `GET` Get a resource or list of resources
- `DELETE` Delete a resource

For PUT and POST requests the body of your request may include a JSON payload, and the URI being requested may include a query string specifying additional filters or commands, all of which are outlined in the following sections.

## HTTP Responses

Each response will include a `status` object and (if successful) a `result` (`result` will be an object for single-record queries and an array for list queries). The `status` object contains an HTTP `status_code`, `text`, `description`, `error_code` (if an error occurred - see [Error Codes]) and pagination info about the result. The `result` contains the result of a successful request.

## HTTP Response Codes

Each response will be returned with one of the following HTTP status codes:

- `200` `OK` The request was successful
- `400` `Bad Request` There was a problem with the request (security, malformed, data validation, etc.)
- `401` `Unauthorized` The supplied API credentials are invalid
- `403` `Forbidden` The credentials provided do not have permission to access the requested resource
- `404` `Not found` An attempt was made to access a resource that does not exist in the API
- `405` `Method not allowed` The resource being accessed doesn't support the method specified (GET, POST, etc.).
- `500` `Server Error` An error on the server occurred

## Request Modifiers

Request modifiers may be included in the request URI query string. The following modifiers are available throughout the API. Other resource-specific modifiers are covered under the specific resource documentation sections.

- `contentType` Returns files with a known contenType (pdf/png/jpeg...)
- `hash` Gets the files from ipfs using their hash (CID)

## Resources

The following resources allow a direct connection with the deployed smart contract on the Ethereum blockchain

### Authentication

- **<code>GET</code> /signup**
- **<code>GET</code> /login**

### File

- **<code>GET</code> /file/getFileByHash**
- **<code>GET</code> /file/getFileByTitle**
- **<code>GET</code> /file/getAllFiles**
- **<code>POST</code> /file/uploadFile**
- **<code>PUT</code> /file/updateFile**
- **<code>DELETE</code> /file/getAllFiles**

A simple <code>POST</code> request to uplaod a file to IPFS using Javascript Fetch :

```no-highlight
var myHeaders = new Headers();
myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiPiIwYWU2NDZmYy1kOTc0LTQ2N2QtOTM5NS05NWY1NGJlYjVkNzkiLCJlbWFpbCI6InNvdWZpYW5laGFqYXppMjNAZ21haWwuY29tIiwiaXNzIjoiU09VRklBTkUiLCJyb2xlIjoidXNlciIsImlhdCI6MTYyNTAwMjE5MH0.OzcUETD2aGawZpOwaH4fxJ_067LHbiOZOI9SsmM7P84");

var formdata = new FormData();
formdata.append("title", "doc1");
formdata.append("file", fileInput.files[0], "doc1.png");
formdata.append("contentType", "png");

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: formdata,
  redirect: 'follow'
};

fetch("http://localhost:3000/v1/ipfs/file/uploadFile", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
```

Response :

```no-highlight
{
    "status": "The file was uploaded with success",
    "title": "Doc1",
    "hashOfFile": "QmQ4e78Qu9B1P2SMGChvLgVqkeL9iPZD4fqby36jbg51vr"
}
```
