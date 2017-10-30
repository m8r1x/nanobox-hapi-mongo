### nanobox-hapi-mongo
A simple RESTful API built with [hapijs], [mongodb] and [nanobox]

### Prerequisites
- MongoDB
- NodeJS (Version used == 8.7.0)

#### Running Tests
The project uses [Code], [Sinon] and [Lab] for testing.

To run the tests:
```
$ yarn test
```

#### Start Server
Import some data into MongoDB from [`test/data.json`](https://github.com/m8r1x/nanobox-hapi-mongo/tree/master/test/data.json) or generate your own [`mockaroo`](https://www.mockaroo.com) or go all in and explore the [`crunchbase api`](https://data.crunchbase.com/v3/docs/using-the-api)

Run
`mongoimport -d crunchbase -c companies --file data.json --jsonArray`

To start the server:
```
$ yarn start
```
The API uses [`jwt`](https://jwt.io/introduction/) authentication so the `Authorization` header is required to access the data.

Using an app like [`Postman`](https://www.getpostman.com/):
- Register with an email *(can be fake but has to adhere to email syntax i.e. `user@provider.domain`)* by visiting [`localhost:11001/v1/user/register`](http://localhost:11001/v1/user/register)

- Login to receive access token which **expires in 1 hour** [`localhost:11001/v1/user/login`](http://localhost:11001/v1/user/login)

Check out the [docs](http://localhost:11001/documentation) for more details

### API docs
Visit [`localhost:11001/documentation`](http://localhost:11001/documentation) to checkout documentation on a [swaggerUI](https://swagger.io/).

### Contributing
1. Fork the repo
2. Edit the code and write tests to verify your feature or bugfix
3. Open a pull request

### License
[MIT](https://opensource.org/license/MIT)

[hapijs]: <https://github.com/hapijs/hapi>
[mongodb]: <https://github.com/Automattic/mongoose>
[nanobox]: <https://github.com/nanobox-io/nanobox>
[Code]: <https://github.com/hapijs/code>
[Lab]: <https://github.com/hapijs/lab>
[Sinon]: <https://github.com/sinonjs/sinon>
