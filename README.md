# PrimeTrustV2 Node

PrimeTrust V2 Node Client.

[API Documentation](https://documentation.primetrust.com/)

## Installation

`primetrust-v2` is available on [NPM](https://www.npmjs.com/package/primetrust-v2).

```
npm install primetrust-v2 --save
```

## API Resources

Check the complete list of common use cases for the [Primetrust API](https://developers.primetrust.com/docs/api-resources-overview).

## Getting started

```javascript
var Client = require("primetrust-v2").Client;

const primetrust = new Client({
    userId: process.env.PRIMETRUST_SERVICE_USER_UUID, // optional UUIDv4 use as X-Idempotent-ID
    username: process.env.PRIMETRUST_SERVICE_USERNAME,
    password: process.env.PRIMETRUST_SERVICE_PASSWORD,
    environment: "sandbox" // defaults to 'sandbox'
});

```

The previous code allows you to integrate with Primetrust solutions and does the following actions:

* Creates a service user.
* Creates a JWT for the user authentication.
* Creates a class abstraction that allows you to call the API.

## Making requests

Once you've created a `Client`, you can make requests using the `#get`, `#post`,
and `#delete` methods. These methods return promises containing a response object
detailed in the [Responses section](#responses).

```javascript
// GET Method
primetrust
  .get("/v2/users")
  .then((res) => console.log(res));

// POST Method
primetrust
  .post("/v2/users",
   {
      "data": {
        "type": "users",
        "attributes": {
          "name": "api_test",
          "email": "api_test@example.com",
          "password": "api_Test11"  //must contain at least one lowercase letter, uppercase letter, and digit and must be at least eight characters in length.
        }
      }
    })
  .then((res) => console.log(res));

// DELETE Method
primetrust.delete(`/v2/contacts/${contact_UUID}`);
```

#### Setting headers

To set additional headers on a request you can pass an `object` as the 3rd argument.

For example:

```javascript
primetrust
    .post(
        "/v2/agreement-previews",
        { 
            data: {
            type: "account",
            "attributes": {...account_attributes}
            } 
        },
        { "X-Idempotent-ID-V2": "a52fcf63-0730-41c3-96e8-7147b5d1fb01" }
    );
```

## Responses

```javascript
primetrust.get("/v2/users").then(
  function(res) {
    // res.status   => 200
    // res.headers  => Headers { ... }
    // res.body     => Object or String depending on response type
  },
  function(error) {
    // when the server return a status >= 400
    // error.status   => 400
    // error.headers  => Headers { ... }
    // error.body     => Object or String depending on response type
  }
);
```

## Contributing

Bug reports and pull requests are welcome on [Github](https://github.com/mauroalejandrojm/primetrust-v2/issues).

## Changelog

- **1.1.1** Expiration token can be set using process.env.PRIMETRUST_TOKEN_EXPIRATION or set to 1hr by default. 
- **1.1.0** Token Manager Function reference fixed, pagination, filering and querying parse not working in query objects for get requests. 