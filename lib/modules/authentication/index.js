'use strict';

const Joi = require('joi');
const Boom = require('boom');

const UserAuth = require('./model');

exports.register = (server, options, next) => {

  const { baseUrl } = options;

  server.route([
    {
      method: 'POST',
      path: baseUrl + '/register',
      config: {
        description: 'register',
        notes: 'Register new users',
        tags: ['api'],
        validate: {
          payload: {
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(8).required()
          }
        }
      },
      handler: (request, reply) => {

        server.methods.registerUser(UserAuth, request.payload,
          (err, result) => {

            if (err) {
              return reply(Boom.boomify(err, {
                statusCode: 500,
                message: 'Internal Server Error caused by MongoDB'
              }));
            }
            if (result.message === 'email exists.') {
              return reply(Boom.badRequest('Error! Email already exists!'));
            }
            reply(result);
          });
      }
    },
    {
      method: 'POST',
      path: baseUrl + '/login',
      config: {
        description: 'login',
        notes: 'User login to receive access token.',
        tags: ['api'],
        validate: {
          payload: {
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(8).required()
          }
        }
      },
      handler: (request, reply) => {

        server.methods.fetchToken(UserAuth, request.payload,
          (err, result) => {

            if (err) {
              return reply(Boom.boomify(err, {
                statusCode: 500,
                message: 'Internal Server Error caused by MongoDB'
              }));
            }
            if (result.message === 'Unauthorized') {
              return reply(Boom.unauthorized('Invalid email or password'));
            }
            if (result.message === 'Not found') {
              return reply(Boom.notFound('User not found'));
            }
            reply({ token: result });
          });
      }
    }
  ]);
  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
