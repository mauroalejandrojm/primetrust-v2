# PrimeTrustV2 Node

PrimeTrust V2 Node Client.

[API Documentation](https://documentation.primetrust.com/)

## Installation

`primetrust-v2` is available on [NPM](https://www.npmjs.com/package/primetrust-v2).

```
npm install dwolla-v2 --save
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

## Contributing

Bug reports and pull requests are welcome on [Github](https://github.com/mauroalejandrojm/primetrust-v2/issues).
