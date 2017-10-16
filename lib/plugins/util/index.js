'use strict';

exports.register = (server, options, next) => {

  server.register([
    {
      register: require('good'),
      options: {
        reporters: {
          console: [
            {
              module: 'good-squeeze',
              name: 'Squeeze',
              args: [{ response: '*', log: '*' }]
            },
            {
              module: 'good-console'
            },
            'stdout'
          ]
        }
      }
    },
    {
      register: require('inert')
    },
    {
      register: require('vision')
    },
    {
      register: require('hapi-swagger'),
      options: {
        info: {
          title: 'CrunchBase Companies',
          description: 'A simple RESTful API to access a cruchbase dataset.',
          version: require('./package.json').version
        },
        basePath: '/v1/'
      }
    }
  ], (err) => {

    if (err) {
      throw err;
    }
  });

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
