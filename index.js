'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({ host: 'localhost', port: 11001 });

server.method('findAndLimitBy', (model, limit, next) => {

  model.find().limit(limit).exec((err, docs) => {

    if (err) {
      next(err);
    }
    return next(err, docs);
  });
});

server.method('findByName', (model, name, next) => {

  model.findOne({ name }).exec((err, docs) => {

    if (err) {
      next(err);
    }
    return next(err, docs);
  });
});

server.register([
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
    register: require('./lib/modules/companies'),
    options: {
      baseUrl: '/v1/companies'
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
