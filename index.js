'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({ host: 'localhost', port: 11001 });

server.register([
  {
    register: require('hapi-auth-jwt')
  },
  {
    register: require('./lib/plugins/util')
  },
  {
    register: require('./lib/plugins/database'),
    options: {
      mongo: {
        uri: 'mongodb://localhost/crunchbase',
        options: {
          useMongoClient: true
        }
      }
    }
  },
  {
    register: require('./lib/modules/dbQuery')
  },
  {
    register: require('./lib/modules/companies'),
    options: {
      baseUrl: '/v1/companies'
    }
  },
  {
    register: require('./lib/modules/authentication'),
    options: {
      baseUrl: '/v1/user'
    }
  }
], (err) => {

  if (err) {
    throw err;
  }
  server.start((err) => {

    if (err) {
      throw err;
    }
    server.log('info', `Server listening on ${server.info.uri}`);
  });
});

module.exports = server;
