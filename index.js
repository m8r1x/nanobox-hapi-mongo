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

server.method('registerUser', (model, payload, next) => {

  model.findOne({ email: payload.email }, (err, user) => {

    if (err) {
      next(err);
    }
    if (user) {
      if (user.email === payload.email) {
        return next(err, { message: 'email exists.' });
      }
    }
    const new_user = new model(payload);
    new_user.save();
    return next(err, { message: 'Registration successful.' });
  });
});

server.method('fetchToken', (model, payload, next) => {

  model.findOne({ email: payload.email }).exec((err, user) => {

    if (err) {
      next(err);
    }
    if (!user) {
      return next(err, { message: 'Not found' });
    }
    user.comparePassword(payload.password, (err, authorized) => {

      if (err) {
        next(err);
      }
      if (!authorized) {
        return next(err, { message: 'Unauthorized' });
      }
      const token = require('jsonwebtoken').sign({
        user: require('lodash').pick(user, ['_id', 'email'])
      }, '3j5OjwA63Bo3WdZFnChCnDuF3PSHtwIkLmNykBjdtXM=',
      { expiresIn: '1h', algorithm: 'HS256' });
      return next(err, token);
    });
  });
});

server.method('validateUser', (email, next) => {

  require('./lib/modules/authentication/model').findOne({
    email }, { email : 1 })
    .exec((err, user) => {

      if (err) {
        return next(err);
      }
      next(err, user);
    });
});

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
