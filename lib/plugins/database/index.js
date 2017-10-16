'use strict';

const Mongoose = require('mongoose');

exports.register = (server, options, next) => {

  Mongoose.Promise = global.Promise;

  Mongoose.connect(options.mongo.uri, options.mongo.options, (err) => {

    if (err) {
      server.log(['error', 'database', 'mongodb'],
        `Unable to connect to MongoDB: ${err.message}`
      );
      process.exit();
    }

    Mongoose.connection.once('open', () => {

      server.log(['info', 'database', 'mongodb'],
        `Connected to MongoDB @${options.mongo.uri}`
      );
    });

    Mongoose.connection.on('connected', () => {

      server.log(['info', 'database', 'mongodb'],
        `Connected to MongoDB @${options.mongo.uri}`
      );
    });

    Mongoose.connection.on('error', (err) => {

      server.log(['error', 'database', 'mongodb'],
        `MongoDB: ${err.message}`
      );
    });

    Mongoose.connection.on('disconnected', () => {

      server.log(['warn', 'database', 'mongodb'],
        'MongoDB was disconnected.'
      );
    });
  });

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
