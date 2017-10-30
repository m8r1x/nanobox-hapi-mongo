'use strict';

exports.register = (server, options, next) => {
  /// DATABASE QUERIES AS SERVER METHODS TO ALLOW STUBING DURING TESTS

  server.method('findAndLimitBy', (model, limit, cb) => {

    model.find().limit(limit).exec((err, docs) => {

      if (err) {
        cb(err);
      }
      return cb(err, docs);
    });
  });

  server.method('findByCategory', (model, category, limit, cb) => {

    model.find({ 'category_list': new RegExp(category) })
      .limit(limit)
      .exec((err, docs) => {

        if (err) {
          cb(err);
        }
        return cb(err, docs);
      });
  });

  server.method('findByName', (model, name, cb) => {

    model.findOne({ name }).exec((err, docs) => {

      if (err) {
        cb(err);
      }
      return cb(err, docs);
    });
  });

  server.method('registerUser', (model, payload, cb) => {

    model.findOne({ email: payload.email }, (err, user) => {

      if (err) {
        cb(err);
      }
      if (user) {
        if (user.email === payload.email) {
          return cb(err, { message: 'email exists.' });
        }
      }
      const new_user = new model(payload);
      new_user.save();
      return cb(err, { message: 'Registration successful.' });
    });
  });

  server.method('fetchToken', (model, payload, cb) => {

    model.findOne({ email: payload.email }).exec((err, user) => {

      if (err) {
        cb(err);
      }
      if (!user) {
        return cb(err, { message: 'Not found' });
      }
      user.comparePassword(payload.password, (err, authorized) => {

        if (err) {
          cb(err);
        }
        if (!authorized) {
          return cb(err, { message: 'Unauthorized' });
        }
        const token = require('jsonwebtoken').sign({
          user: require('lodash').pick(user, ['_id', 'email'])
        }, '3j5OjwA63Bo3WdZFnChCnDuF3PSHtwIkLmNykBjdtXM=',
        { expiresIn: '1h', algorithm: 'HS256' });
        return cb(err, token);
      });
    });
  });

  server.method('validateUser', (email, cb) => {

    require('../authentication/model').findOne({
      email }, { email : 1 })
      .exec((err, user) => {

        if (err) {
          return cb(err);
        }
        cb(err, user);
      });
  });
  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
