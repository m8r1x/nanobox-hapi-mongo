'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Companies = require('./model');

const error = Joi.object().keys({
  statusCode: Joi.number(),
  error: Joi.string(),
  message: Joi.string()
});

const schema = Joi.object().keys({
  _id: Joi.string(),
  permalink: Joi.string(),
  name: Joi.string(),
  homepage_url: Joi.string().allow(''),
  category_list: Joi.string(),
  funding_total_usd: Joi.number(),
  status: Joi.string(),
  country_code: Joi.string().allow(''),
  state_code: Joi.string().allow(''),
  region: Joi.string().allow(''),
  city: Joi.string().allow(''),
  funding_rounds: Joi.number(),
  founded_at: Joi.string().isoDate().allow(''),
  first_funding_at: Joi.date(),
  last_funding_at: Joi.date()/*,
  $__: Joi.object(),
  isNew: Joi.boolean(),
  errors: Joi.object(),
  _doc: Joi.object(),
  $init: Joi.boolean()*/
}).unknown();


exports.register = (server, options, next) => {

  const { baseUrl } = options;

  server.auth.strategy('token', 'jwt', {
    key: '3j5OjwA63Bo3WdZFnChCnDuF3PSHtwIkLmNykBjdtXM=',
    validateFunc: (request, decoded, cb) => {

      server.methods.validateUser(decoded.user.email, (err, user) => {

        if (err) {
          return cb(err, false, {});
        }
        if (!user) {
          return cb(err, false, {});
        }
        if (user) {
          if (decoded.user.email === user.email) {
            return cb(null, true, user);
          }
        }
        return cb(null, false, {});
      });
    },
    verifyOptions: { algorithms: ['HS256'] }
  });

  server.route([
    {
      method: 'GET',
      path: baseUrl,
      config: {
        description: 'companies',
        notes: 'Get a list of companies from the database',
        tags: ['api'],
        validate: {
          query: {
            limit: Joi.number().min(1).max(20).default(5)
          }
        },
        response: {
          status: {
            200: Joi.array().items(schema),
            400: error,
            500: error
          }
        },
        auth: {
          strategy: 'token'
        }
      },
      handler: (request, reply) => {

        server.methods.findAndLimitBy(Companies, request.query.limit,
          (err, result) => {

            if (err) {
              return reply(Boom.boomify(err, {
                statusCode: 500,
                message: 'Internal Server Error caused by MongoDB'
              }));
            }
            reply(result);
          }
        );
      }
    },
    {
      method: 'GET',
      path: baseUrl + '/{name}',
      config: {
        description: 'companies:name',
        notes: 'Get a company by its name',
        tags: ['api'],
        validate: {
          params: {
            name: Joi.string().required()
          }
        },
        response: {
          status: {
            200: schema,
            400: error,
            500: error
          }
        },
        auth: {
          strategy: 'token'
        }
      },
      handler: (request, reply) => {

        server.methods.findByName(Companies, request.params.name,
          (err, result) => {

            if (err) {
              return reply(Boom.boomify(err, {
                statusCode: 500,
                message: 'Internal Server Error caused by MongoDB'
              }));
            }
            if (!result) {
              return reply(Boom.notFound());
            }
            reply(result);
          });
      }
    }
  ]);

  return next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
